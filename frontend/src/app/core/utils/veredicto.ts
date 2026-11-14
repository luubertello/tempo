import { Diferencia, EjercicioDeSesion, SerieDeSesion, Veredicto } from '../models/sesion.model';
import { formatoDuracion } from './formato';

export type EstadoMarca = Veredicto | 'PENDIENTE';

const SIMBOLOS: Record<EstadoMarca, string> = {
  CUMPLIDA: '✓',
  SUPERADA: '▲',
  POR_DEBAJO: '▼',
  DISTINTA: '≠',
  EXTRA: '+',
  SIN_HACER: '–',
  PENDIENTE: '·',
};

export const simboloDe = (estado: EstadoMarca): string => SIMBOLOS[estado];

const signo = (n: number): string => (n > 0 ? '+' : '−');

export function textoDiferencia(d: Diferencia | null): string {
  if (!d) return '';
  const partes: string[] = [];
  if (d.repeticiones) {
    const n = Math.abs(d.repeticiones);
    partes.push(`${signo(d.repeticiones)}${n} ${n === 1 ? 'rep' : 'reps'}`);
  }
  if (d.carga) partes.push(`${signo(d.carga)}${Math.abs(d.carga).toLocaleString('es-AR')} kg`);
  if (d.duracionSegundos) partes.push(`${signo(d.duracionSegundos)}${formatoDuracion(Math.abs(d.duracionSegundos))}`);
  return partes.join(', ');
}

export function frase(serie: SerieDeSesion): string {
  const dif = textoDiferencia(serie.diferencia);
  switch (serie.veredicto) {
    case 'CUMPLIDA':
      return 'Cumpliste el objetivo';
    case 'SUPERADA':
      return `Superaste el objetivo: ${dif}`;
    case 'POR_DEBAJO':
      return `Por debajo del objetivo: ${dif}`;
    case 'DISTINTA':
      return `Distinta del objetivo: ${dif}`;
    case 'EXTRA':
      return 'Serie extra, fuera del plan';
    case 'SIN_HACER':
      return 'No hecha';
  }
}

export function estadosDeEjercicio(e: EjercicioDeSesion, enCurso: boolean): EstadoMarca[] {
  return e.series.map((s) => {
    if (s.completada) return s.veredicto;
    return enCurso && !e.omitido ? 'PENDIENTE' : 'SIN_HACER';
  });
}