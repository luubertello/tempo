import { EstadoSesion } from '../domain/estado-sesion';
import { Sesion } from '../domain/sesion';
import { SesionRepositorio } from '../domain/sesion.repositorio';
import {
  FiltroPublicado,
  SesionesFinalizadas,
  SesionFinalizadaPublicada,
} from '../published/sesiones-finalizadas';

export class PublicadorDeSesionesFinalizadas extends SesionesFinalizadas {
  constructor(private readonly sesiones: SesionRepositorio) {
    super();
  }

  async deUsuario(usuarioId: string, filtro: FiltroPublicado = {}): Promise<SesionFinalizadaPublicada[]> {
    const sesiones = await this.sesiones.listar(usuarioId, {
      estado: EstadoSesion.FINALIZADA,
      desde: filtro.desde,
      hasta: filtro.hasta,
    });
    return sesiones.map((s) => aPublicada(s, filtro.ejercicioId)).filter((s) => s.ejercicios.length > 0);
  }
}

function aPublicada(s: Sesion, ejercicioId?: string): SesionFinalizadaPublicada {
  return {
    fechaSesion: s.fechaSesion,
    ejercicios: s.ejercicios
      .filter((e) => !ejercicioId || e.ejercicioId === ejercicioId)
      .map((e) => ({
        ejercicioId: e.ejercicioId,
        series: e.series
          .filter((x) => x.completada)
          .map((x) => ({ repeticiones: x.repeticiones, carga: x.carga, duracionSegundos: x.duracionSegundos })),
      }))
      .filter((e) => e.series.length > 0),
  };
}