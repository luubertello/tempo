import { TipoMedicion } from '../models/ejercicio.model';

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