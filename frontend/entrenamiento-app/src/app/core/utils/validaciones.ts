import { LIMITES } from '../config/limites';
import { TipoMedicion } from '../models/ejercicio.model';
import { DatosSerie } from '../models/rutina.model';

export type Modo = 'conCarga' | 'reps' | 'tiempo';

export function modoDeTipo(tipo?: TipoMedicion): Modo {
  switch (tipo) {
    case 'REPETICIONES_CON_CARGA':
      return 'conCarga';
    case 'TIEMPO':
      return 'tiempo';
    default:
      return 'reps';
  }
}

export function entero(texto: string, min: number, max: number): number | null {
  if (!/^\d+$/.test(texto.trim())) return null;
  const n = Number(texto);
  return n >= min && n <= max ? n : null;
}

export function decimal(texto: string, max: number): number | null {
  const t = texto.trim().replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(t)) return null;
  const n = Number(t);
  return n > 0 && n <= max ? n : null;
}

export interface SerieEscrita {
  repeticiones: string;
  carga: string;
  duracion: string;
}

export function armarSerieReal(modo: Modo, b: SerieEscrita): { datos?: DatosSerie; aviso?: string } {
  if (modo === 'tiempo') {
    const d = entero(b.duracion, 1, LIMITES.DURACION_MAX_SEGUNDOS);
    return d === null
      ? { aviso: `La duración tiene que ser un número entero de segundos, entre 1 y ${LIMITES.DURACION_MAX_SEGUNDOS}.` }
      : { datos: { duracionSegundos: d } };
  }
  const r = entero(b.repeticiones, 1, LIMITES.REPETICIONES_MAX);
  if (r === null) {
    return { aviso: `Las repeticiones tienen que ser un número entero, entre 1 y ${LIMITES.REPETICIONES_MAX}.` };
  }
  if (modo === 'reps') return { datos: { repeticiones: r } };

  const c = decimal(b.carga, LIMITES.CARGA_MAX_KG);
  return c === null
    ? { aviso: `Cargá el peso: mayor a 0 y hasta ${LIMITES.CARGA_MAX_KG} kg, con hasta 2 decimales.` }
    : { datos: { repeticiones: r, carga: c } };
}