import { SerieIncoherente } from './errores';
import { LIMITES } from './limites';

export function validarRepeticiones(v: number): void {
  if (!Number.isInteger(v) || v < 1 || v > LIMITES.REPETICIONES_MAX) {
    throw new SerieIncoherente(`Las repeticiones deben ser un entero entre 1 y ${LIMITES.REPETICIONES_MAX}.`);
  }
}

// Carga en kg, mayor a 0, hasta 2 decimales.
export function validarCarga(v: number): void {
  const dosDecimales = Math.abs(v * 100 - Math.round(v * 100)) < 1e-6;
  if (!Number.isFinite(v) || v <= 0 || v > LIMITES.CARGA_MAX_KG || !dosDecimales) {
    throw new SerieIncoherente(`La carga debe ser mayor a 0 y hasta ${LIMITES.CARGA_MAX_KG} kg, con hasta 2 decimales.`);
  }
}

// Duración en segundos.
export function validarDuracion(v: number): void {
  if (!Number.isInteger(v) || v < 1 || v > LIMITES.DURACION_MAX_SEGUNDOS) {
    throw new SerieIncoherente(`La duración debe ser un entero de segundos entre 1 y ${LIMITES.DURACION_MAX_SEGUNDOS}.`);
  }
}