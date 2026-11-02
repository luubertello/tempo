import { Injectable } from '@nestjs/common';
import { DataSource, In, QueryFailedError } from 'typeorm';
import { EjercicioRealizado } from '../domain/ejercicio-realizado';
import { SesionEnCursoExistente } from '../domain/errores-sesion';
import { EstadoSesion } from '../domain/estado-sesion';
import { Sesion } from '../domain/sesion';
import { SesionRepositorio } from '../domain/sesion.repositorio';
import { SerieRealizada } from '../domain/serie-realizada';
import {
  SesionEjercicioFila,
  SesionEjercicioSchema,
  SesionFila,
  SesionSchema,
  SesionSerieFila,
  SesionSerieSchema,
} from './sesion.schemas';

const INDICE_UNA_EN_CURSO = 'ux_sesion_en_curso_por_usuario';

@Injectable()
export class SesionRepositorioTypeOrm extends SesionRepositorio {
  constructor(private readonly ds: DataSource) {
    super();
  }

  async buscarPorId(id: string): Promise<Sesion | null> {
    const fila = await this.ds.getRepository<SesionFila>(SesionSchema).findOneBy({ id });
    return fila ? (await this.armar([fila]))[0] : null;
  }

  async buscarEnCurso(usuarioId: string): Promise<Sesion | null> {
    const fila = await this.ds
      .getRepository<SesionFila>(SesionSchema)
      .findOneBy({ usuarioId, estado: EstadoSesion.EN_CURSO });
    return fila ? (await this.armar([fila]))[0] : null;
  }

  async guardar(s: Sesion): Promise<void> {
    try {
      await this.ds.transaction(async (m) => {
        await m.getRepository<SesionFila>(SesionSchema).save({
          id: s.id,
          usuarioId: s.usuarioId,
          rutinaId: s.rutinaId,
          nombreRutina: s.nombreRutina,
          fechaSesion: s.fechaSesion,
          fechaRegistro: s.fechaRegistro,
          estado: s.estado,
        });
        await m.getRepository<SesionEjercicioFila>(SesionEjercicioSchema).delete({ sesionId: s.id });

        const ejercicios: SesionEjercicioFila[] = s.ejercicios.map((e) => ({
          sesionId: s.id,
          orden: e.orden,
          ejercicioId: e.ejercicioId,
          omitido: e.omitido,
        }));
        const series: SesionSerieFila[] = s.ejercicios.flatMap((e) =>
          e.series.map((x) => ({
            sesionId: s.id,
            ordenEjercicio: e.orden,
            orden: x.orden,
            completada: x.completada,
            repeticiones: x.repeticiones,
            carga: x.carga,
            duracionSegundos: x.duracionSegundos,
            objetivoRepeticiones: x.objetivo?.repeticiones ?? null,
            objetivoCarga: x.objetivo?.carga ?? null,
            objetivoDuracionSegundos: x.objetivo?.duracionSegundos ?? null,
          })),
        );
        if (ejercicios.length > 0) await m.getRepository<SesionEjercicioFila>(SesionEjercicioSchema).insert(ejercicios);
        if (series.length > 0) await m.getRepository<SesionSerieFila>(SesionSerieSchema).insert(series);
      });
    } catch (e) {
      if (e instanceof QueryFailedError && (e.driverError as { constraint?: string })?.constraint === INDICE_UNA_EN_CURSO) {
        throw new SesionEnCursoExistente();
      }
      throw e;
    }
  }

  private async armar(filas: SesionFila[]): Promise<Sesion[]> {
    if (filas.length === 0) return [];
    const ids = filas.map((f) => f.id);
    const ejs = await this.ds
      .getRepository<SesionEjercicioFila>(SesionEjercicioSchema)
      .find({ where: { sesionId: In(ids) }, order: { orden: 'ASC' } });
    const sers = await this.ds
      .getRepository<SesionSerieFila>(SesionSerieSchema)
      .find({ where: { sesionId: In(ids) }, order: { ordenEjercicio: 'ASC', orden: 'ASC' } });

    return filas.map((f) =>
      Sesion.reconstruir(
        f.id,
        f.usuarioId,
        f.rutinaId,
        f.nombreRutina,
        f.fechaSesion,
        f.fechaRegistro,
        f.estado as EstadoSesion,
        ejs
          .filter((e) => e.sesionId === f.id)
          .map(
            (e) =>
              new EjercicioRealizado(
                e.orden,
                e.ejercicioId,
                e.omitido,
                sers
                  .filter((s) => s.sesionId === f.id && s.ordenEjercicio === e.orden)
                  .map((s) =>
                    SerieRealizada.reconstruir(
                      s.orden,
                      s.completada,
                      s.repeticiones,
                      s.carga,
                      s.duracionSegundos,
                      s.objetivoRepeticiones === null && s.objetivoCarga === null && s.objetivoDuracionSegundos === null
                        ? null
                        : {
                            repeticiones: s.objetivoRepeticiones,
                            carga: s.objetivoCarga,
                            duracionSegundos: s.objetivoDuracionSegundos,
                          },
                    ),
                  ),
              ),
          ),
      ),
    );
  }
}