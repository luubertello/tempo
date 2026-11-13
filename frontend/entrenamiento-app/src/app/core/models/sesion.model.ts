export type EstadoSesion = 'EN_CURSO' | 'FINALIZADA' | 'ABANDONADA';
export type ResultadoEjercicio = 'PENDIENTE' | 'CUMPLIDO' | 'MODIFICADO' | 'OMITIDO' | 'SIN_PLAN';

export interface ObjetivoSerie {
  repeticiones: number | null;
  carga: number | null;
  duracionSegundos: number | null;
}

export interface SerieDeSesion {
  orden: number;
  completada: boolean;
  repeticiones: number | null;
  carga: number | null;
  duracionSegundos: number | null;
  objetivo: ObjetivoSerie | null;
}

export interface EjercicioDeSesion {
  orden: number;
  ejercicioId: string;
  omitido: boolean;
  resultado: ResultadoEjercicio;
  series: SerieDeSesion[];
}

export interface Sesion {
  id: string;
  rutinaId: string | null;
  nombreRutina: string | null;
  fechaSesion: string; 
  fechaRegistro: string;
  estado: EstadoSesion;
  ejercicios: EjercicioDeSesion[];
}

export interface ResumenSesion {
  id: string;
  rutinaId: string | null;
  nombreRutina: string | null;
  fechaSesion: string;
  estado: EstadoSesion;
  cantidadEjercicios: number;
  seriesCompletadas: number;
}