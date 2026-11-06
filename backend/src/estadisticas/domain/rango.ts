import { FechaDeFiltroInvalida, RangoDeFechasInvalido } from './errores';

function esFechaReal(f: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(f)) return false;
  const d = new Date(`${f}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === f;
}

export function validarRango(desde?: string, hasta?: string): void {
  for (const f of [desde, hasta]) {
    if (f !== undefined && !esFechaReal(f)) throw new FechaDeFiltroInvalida();
  }
  if (desde && hasta && desde > hasta) throw new RangoDeFechasInvalido();
}