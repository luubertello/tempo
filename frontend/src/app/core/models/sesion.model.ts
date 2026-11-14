import { DatosSerie } from './rutina.model';

export type EstadoSesion = 'EN_CURSO' | 'FINALIZADA' | 'ABANDONADA';
export type ResultadoEjercicio = 'PENDIENTE' | 'CUMPLIDO' | 'MODIFICADO' | 'OMITIDO' | 'SIN_PLAN';

export type Veredicto = 'CUMPLIDA' | 'SUPERADA' | 'POR_DEBAJO' | 'DISTINTA' | 'EXTRA' | 'SIN_HACER';

export interface ObjetivoSerie {
  repeticiones: number | null;
  carga: number | null;
  duracionSegundos: number | null;
}

export type Diferencia = ObjetivoSerie;

export interface Balance {
  planificadas: number;
  logradas: number; 
  cumplidas: number;
  superadas: number;
  porDebajo: number;
  distintas: number;
  sinHacer: number;
  extras: number;
  hechas: number;
}

export interface SerieDeSesion {
  orden: number;
  completada: boolean;
  repeticiones: number | null;
  carga: number | null;
  duracionSegundos: number | null;
  objetivo: ObjetivoSerie | null;
  veredicto: Veredicto;
  diferencia: Diferencia | null;
}

export interface EjercicioDeSesion {
  orden: number;
  ejercicioId: string;
  omitido: boolean;
  resultado: ResultadoEjercicio;
  balance: Balance;
  series: SerieDeSesion[];
}

export interface Sesion {
  id: string;
  rutinaId: string | null;
  nombreRutina: string | null;
  fechaSesion: string; 
  fechaRegistro: string;
  estado: EstadoSesion;
  balance: Balance;
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
  balance: Balance;
}

export interface SerieHecha extends DatosSerie {
  completada: boolean;
}

export interface DatosSesionPasada {
  fecha: string; // AAAA-MM-DD
  rutinaId?: string;
  ejercicios: { ejercicioId: string; omitido: boolean; series: SerieHecha[] }[];
}