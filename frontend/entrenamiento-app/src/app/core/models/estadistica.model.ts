export type Unidad = 'kg' | 'reps' | 'seg';

export interface ResumenEjercicio {
  ejercicioId: string;
  nombre: string;
  unidad: Unidad;
  vecesRealizado: number;
  marcaMaxima: number;
}

export interface PuntoEvolucion {
  fechaSesion: string; 
  valor: number;
}

export interface Evolucion {
  ejercicioId: string;
  nombre: string;
  unidad: Unidad;
  puntos: PuntoEvolucion[]; 
}