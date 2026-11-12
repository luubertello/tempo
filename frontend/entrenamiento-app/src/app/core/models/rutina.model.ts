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