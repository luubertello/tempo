import { SerieIncoherente } from './errores-rutina';
import { LIMITES } from './limites';
import { FechaFutura, FechaInvalida } from './errores-sesion';

export function validarRepeticiones(v: number): void {
  if (!Number.isInteger(v) || v < 1 || v > LIMITES.REPETICIONES_MAX) {
    throw new SerieIncoherente(`Las repeticiones deben ser un entero entre 1 y ${LIMITES.REPETICIONES_MAX}.`);
  }
}

export function validarCarga(v: number): void {
  const dosDecimales = Math.abs(v * 100 - Math.round(v * 100)) < 1e-6;
  if (!Number.isFinite(v) || v <= 0 || v > LIMITES.CARGA_MAX_KG || !dosDecimales) {
    throw new SerieIncoherente(`La carga debe ser mayor a 0 y hasta ${LIMITES.CARGA_MAX_KG} kg, con hasta 2 decimales.`);
  }
}

export function validarDuracion(v: number): void {
  if (!Number.isInteger(v) || v < 1 || v > LIMITES.DURACION_MAX_SEGUNDOS) {
    throw new SerieIncoherente(`La duración debe ser un entero de segundos entre 1 y ${LIMITES.DURACION_MAX_SEGUNDOS}.`);
  }
}

export function validarFechaSesion(fecha: string, hoy: string): void {
  const formatoOk = /^\d{4}-\d{2}-\d{2}$/.test(fecha);
  const real = formatoOk && new Date(`${fecha}T00:00:00Z`).toISOString().slice(0, 10) === fecha;
  if (!real) throw new FechaInvalida();
  if (fecha > hoy) throw new FechaFutura();
}