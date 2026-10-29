import { Ejercicio } from '../domain/ejercicio';

export interface EjercicioRespuesta {
  id: string;
  nombre: string;
  tipo_medicion: string;
}

export const aRespuesta = (e: Ejercicio): EjercicioRespuesta => ({
  id: e.id,
  nombre: e.nombre,
  tipo_medicion: e.tipoMedicion,
});