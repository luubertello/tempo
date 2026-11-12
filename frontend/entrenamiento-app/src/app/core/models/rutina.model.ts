export type OrigenRutina = 'PROPIA' | 'PREDEFINIDA';

export interface SerieDeRutina {
  orden: number;
  repeticiones: number | null;
  carga: number | null;
  duracionSegundos: number | null;
}

export interface EjercicioDeRutina {
  orden: number;
  ejercicioId: string;
  series: SerieDeRutina[];
}

export interface Rutina {
  id: string;
  nombre: string;
  origen: OrigenRutina;
  ejercicios: EjercicioDeRutina[];
}

export interface DatosSerie {
  repeticiones?: number;
  carga?: number;
  duracionSegundos?: number;
}

export interface DatosRutina {
  nombre: string;
  ejercicios: { ejercicioId: string; series: DatosSerie[] }[];
}