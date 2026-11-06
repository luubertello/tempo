import { SesionesFinalizadas } from '../../entrenamiento/published/sesiones-finalizadas';
import { CatalogoParaEstadisticas } from '../domain/catalogo-para-estadisticas';
import { calcularEvolucion, PuntoDeEvolucion } from '../domain/calculos';
import { EjercicioNoEncontrado } from '../domain/errores';
import { validarRango } from '../domain/rango';
import { Unidad, unidadDe } from '../domain/unidad';

export interface EvolucionDeEjercicio {
  ejercicioId: string;
  nombre: string;
  unidad: Unidad;
  puntos: PuntoDeEvolucion[];
}

export class EvolucionDeEjercicioCasoDeUso {
  constructor(
    private readonly sesiones: SesionesFinalizadas,
    private readonly catalogo: CatalogoParaEstadisticas,
  ) {}

  async ejecutar(e: { usuarioId: string; ejercicioId: string; desde?: string; hasta?: string }): Promise<EvolucionDeEjercicio> {
    validarRango(e.desde, e.hasta);
    const datos = (await this.catalogo.datosDe([e.ejercicioId])).get(e.ejercicioId);
    if (!datos) throw new EjercicioNoEncontrado();

    const sesiones = await this.sesiones.deUsuario(e.usuarioId, {
      ejercicioId: e.ejercicioId,
      desde: e.desde,
      hasta: e.hasta,
    });
    return {
      ejercicioId: e.ejercicioId,
      nombre: datos.nombre,
      unidad: unidadDe(datos.tipoMedicion),
      puntos: calcularEvolucion(sesiones, e.ejercicioId, datos.tipoMedicion),
    };
  }
}