import { EjercicioDeSesion, ResultadoEjercicio, SerieDeSesion } from '../models/sesion.model';

export const seriesHechas = (e: EjercicioDeSesion): number => e.series.filter((s) => s.completada).length;

export function difiereDelObjetivo(s: SerieDeSesion): boolean {
  const o = s.objetivo;
  if (!o) return false;
  return (
    (o.repeticiones !== null && o.repeticiones !== s.repeticiones) ||
    (o.carga !== null && o.carga !== s.carga) ||
    (o.duracionSegundos !== null && o.duracionSegundos !== s.duracionSegundos)
  );
}

const ETIQUETAS: Record<ResultadoEjercicio, string> = {
  CUMPLIDO: 'Cumplido',
  MODIFICADO: 'Modificado',
  OMITIDO: 'Omitido',
  PENDIENTE: 'Pendiente',
  SIN_PLAN: '',
};
export const etiquetaResultado = (r: ResultadoEjercicio): string => ETIQUETAS[r];