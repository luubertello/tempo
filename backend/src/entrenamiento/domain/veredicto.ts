

export interface Medidas {
  repeticiones: number | null;
  carga: number | null;
  duracionSegundos: number | null;
}

export type Diferencia = Medidas;

export enum VeredictoSerie {
  CUMPLIDA = 'CUMPLIDA',
  SUPERADA = 'SUPERADA',
  POR_DEBAJO = 'POR_DEBAJO',
  DISTINTA = 'DISTINTA',
  EXTRA = 'EXTRA',
  SIN_HACER = 'SIN_HACER',
}

const resta = (real: number | null, objetivo: number | null): number | null =>
  real === null || objetivo === null ? null : Math.round((real - objetivo) * 100) / 100;

export function calcularDiferencia(objetivo: Medidas, real: Medidas): Diferencia {
  return {
    repeticiones: resta(real.repeticiones, objetivo.repeticiones),
    carga: resta(real.carga, objetivo.carga),
    duracionSegundos: resta(real.duracionSegundos, objetivo.duracionSegundos),
  };
}

// Solo para series completadas con objetivo.
export function veredictoDe(d: Diferencia): VeredictoSerie {
  const diferencias = [d.repeticiones, d.carga, d.duracionSegundos].filter((x): x is number => x !== null);
  const sube = diferencias.some((x) => x > 0);
  const baja = diferencias.some((x) => x < 0);
  if (sube && baja) return VeredictoSerie.DISTINTA;
  if (sube) return VeredictoSerie.SUPERADA;
  if (baja) return VeredictoSerie.POR_DEBAJO;
  return VeredictoSerie.CUMPLIDA;
}