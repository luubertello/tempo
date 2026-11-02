import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { OrigenRutina } from '../domain/origen-rutina';
import { EjercicioPlanificado, Rutina } from '../domain/rutina';
import { RutinaRepositorio } from '../domain/rutina.repositorio';
import { SeriePlanificada } from '../domain/serie-planificada';
import { RutinaEjercicioFila, RutinaEjercicioSchema, RutinaFila, RutinaSchema, RutinaSerieFila, RutinaSerieSchema } from './rutina.schemas';


@Injectable()
export class RutinaRepositorioTypeOrm extends RutinaRepositorio {
  constructor(private readonly ds: DataSource) {
    super();
  }

  async buscarPorId(id: string): Promise<Rutina | null> {
    const fila = await this.ds.getRepository<RutinaFila>(RutinaSchema).findOneBy({ id });
    return fila ? (await this.armar([fila]))[0] : null;
  }

  async listarPropias(usuarioId: string): Promise<Rutina[]> {
    const filas = await this.ds
      .getRepository<RutinaFila>(RutinaSchema)
      .find({ where: { usuarioId, origen: OrigenRutina.PROPIA }, order: { nombre: 'ASC' } });
    return this.armar(filas);
  }

  async listarPredefinidas(): Promise<Rutina[]> {
    const filas = await this.ds
      .getRepository<RutinaFila>(RutinaSchema)
      .find({ where: { origen: OrigenRutina.PREDEFINIDA }, order: { nombre: 'ASC' } });
    return this.armar(filas);
  }

  async guardar(r: Rutina): Promise<void> {
    await this.ds.transaction(async (m) => {
      await m.getRepository<RutinaFila>(RutinaSchema).save({
        id: r.id,
        usuarioId: r.usuarioId,
        nombre: r.nombre,
        origen: r.origen,
      });
      await m.getRepository<RutinaEjercicioFila>(RutinaEjercicioSchema).delete({ rutinaId: r.id });

      const ejercicios: RutinaEjercicioFila[] = r.ejercicios.map((e) => ({
        rutinaId: r.id,
        orden: e.orden,
        ejercicioId: e.ejercicioId,
      }));
      const series: RutinaSerieFila[] = r.ejercicios.flatMap((e) =>
        e.series.map((s, i) => ({
          rutinaId: r.id,
          ordenEjercicio: e.orden,
          orden: i + 1,
          repeticiones: s.repeticiones,
          carga: s.carga,
          duracionSegundos: s.duracionSegundos,
        })),
      );
      await m.getRepository<RutinaEjercicioFila>(RutinaEjercicioSchema).insert(ejercicios);
      await m.getRepository<RutinaSerieFila>(RutinaSerieSchema).insert(series);
    });
  }

  async eliminar(id: string): Promise<void> {
    await this.ds.getRepository<RutinaFila>(RutinaSchema).delete({ id });
  }

  private async armar(filas: RutinaFila[]): Promise<Rutina[]> {
    if (filas.length === 0) return [];
    const ids = filas.map((f) => f.id);
    const ejs = await this.ds
      .getRepository<RutinaEjercicioFila>(RutinaEjercicioSchema)
      .find({ where: { rutinaId: In(ids) }, order: { orden: 'ASC' } });
    const sers = await this.ds
      .getRepository<RutinaSerieFila>(RutinaSerieSchema)
      .find({ where: { rutinaId: In(ids) }, order: { ordenEjercicio: 'ASC', orden: 'ASC' } });

    return filas.map((f) =>
      Rutina.reconstruir(
        f.id,
        f.usuarioId,
        f.nombre,
        f.origen as OrigenRutina,
        ejs
          .filter((e) => e.rutinaId === f.id)
          .map(
            (e) =>
              new EjercicioPlanificado(
                e.orden,
                e.ejercicioId,
                sers
                  .filter((s) => s.rutinaId === f.id && s.ordenEjercicio === e.orden)
                  .map((s) => SeriePlanificada.reconstruir(s.repeticiones, s.carga, s.duracionSegundos)),
              ),
          ),
      ),
    );
  }
}