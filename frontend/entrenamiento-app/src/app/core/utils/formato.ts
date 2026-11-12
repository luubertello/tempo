import { SerieDeRutina } from '../models/rutina.model';

export const plural = (n: number, singular: string, plural: string): string =>
  `${n} ${n === 1 ? singular : plural}`;

export function formatoDuracion(segundos: number): string {
  if (segundos < 60) return `${segundos} s`;
  const min = Math.floor(segundos / 60);
  const resto = segundos % 60;
  return resto === 0 ? `${min} min` : `${min} min ${resto} s`;
}

export function textoSerie(s: SerieDeRutina): string {
  if (s.duracionSegundos !== null) return formatoDuracion(s.duracionSegundos);
  if (s.repeticiones !== null && s.carga !== null) return `${s.repeticiones} × ${s.carga.toLocaleString('es-AR')} kg`;
  return `${s.repeticiones} reps`;
}