import { LIMITES } from '../config/limites';
import { TipoMedicion } from '../models/ejercicio.model';
import { DatosSerie } from '../models/rutina.model';

export type Modo = 'conCarga' | 'reps' | 'tiempo';
export type CampoSerie = 'repeticiones' | 'carga' | 'duracion';
export type ErroresSerie = Partial<Record<CampoSerie, string>>;

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

export function validarSerie(
  modo: Modo,
  b: SerieEscrita,
  cargaObligatoria: boolean,
): { datos?: DatosSerie; errores: ErroresSerie } {
  const errores: ErroresSerie = {};
  const datos: DatosSerie = {};

  if (modo === 'tiempo') {
    const d = entero(b.duracion, 1, LIMITES.DURACION_MAX_SEGUNDOS);
    if (d === null) errores.duracion = `Poné los segundos, un número entero entre 1 y ${LIMITES.DURACION_MAX_SEGUNDOS}.`;
    else datos.duracionSegundos = d;
  } else {
    const r = entero(b.repeticiones, 1, LIMITES.REPETICIONES_MAX);
    if (r === null) errores.repeticiones = `Poné un número entero entre 1 y ${LIMITES.REPETICIONES_MAX}.`;
    else datos.repeticiones = r;

    if (modo === 'conCarga') {
      if (b.carga.trim() === '') {
        if (cargaObligatoria) errores.carga = 'Cargá el peso que usaste.';
      } else {
        const c = decimal(b.carga, LIMITES.CARGA_MAX_KG);
        if (c === null) errores.carga = `Poné un peso mayor a 0 y hasta ${LIMITES.CARGA_MAX_KG} kg, con hasta 2 decimales.`;
        else datos.carga = c;
      }
    }
  }
  return Object.keys(errores).length > 0 ? { errores } : { datos, errores };
}