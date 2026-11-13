export type TipoMedicion = 'REPETICIONES_CON_CARGA' | 'REPETICIONES_PESO_CORPORAL' | 'TIEMPO';

export interface Ejercicio {
  id: string;
  nombre: string;
  tipoMedicion: TipoMedicion;
}