

export interface SerieCompletadaPublicada {
  repeticiones: number | null;
  carga: number | null;
  duracionSegundos: number | null;
}

export interface EjercicioPublicado {
  ejercicioId: string;
  series: SerieCompletadaPublicada[];
}

export interface SesionFinalizadaPublicada {
  fechaSesion: string; 
  ejercicios: EjercicioPublicado[]; 
}

export interface FiltroPublicado {
  ejercicioId?: string;
  desde?: string; 
  hasta?: string; 
}

export abstract class SesionesFinalizadas {
  abstract deUsuario(usuarioId: string, filtro?: FiltroPublicado): Promise<SesionFinalizadaPublicada[]>;
}