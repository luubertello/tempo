import { SerieDeRutina } from '../models/rutina.model';
import { TipoMedicion } from '../models/ejercicio.model';
import { Unidad } from '../models/estadistica.model';

export const plural = (n: number, singular: string, plural: string): string =>
  `${n} ${n === 1 ? singular : plural}`;

export function formatoDuracion(segundos: number): string {
  if (segundos < 60) return `${segundos} s`;
  const min = Math.floor(segundos / 60);
  const resto = segundos % 60;
  return resto === 0 ? `${min} min` : `${min} min ${resto} s`;
}

export function textoSerie(s: Pick<SerieDeRutina, 'repeticiones' | 'carga' | 'duracionSegundos'>): string {
  if (s.duracionSegundos !== null) return formatoDuracion(s.duracionSegundos);
  if (s.repeticiones !== null && s.carga !== null) return `${s.repeticiones} × ${s.carga.toLocaleString('es-AR')} kg`;
  return `${s.repeticiones} reps`;
}

const ETIQUETAS_TIPO: Record<TipoMedicion, string> = {
  REPETICIONES_CON_CARGA: 'Repeticiones con carga',
  REPETICIONES_PESO_CORPORAL: 'Peso corporal',
  TIEMPO: 'Tiempo',
};
export const etiquetaTipo = (tipo: TipoMedicion): string => ETIQUETAS_TIPO[tipo];

export const valorDe = (ev: Event): string => String((ev as CustomEvent).detail?.value ?? '');

export const normalizar = (s: string): string =>
  s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();

export function formatoFecha(iso: string): string {
  const [a, m, d] = iso.split('-').map(Number);
  const texto = new Date(a, m - 1, d).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function formatoValor(valor: number, unidad: Unidad): string {
  if (unidad === 'seg') return formatoDuracion(valor);
  return `${valor.toLocaleString('es-AR')} ${unidad}`;
}

export function fechaCorta(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

export function isoHaceDias(dias: number): string {
  const f = new Date();
  f.setDate(f.getDate() - dias);
  return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`;
}