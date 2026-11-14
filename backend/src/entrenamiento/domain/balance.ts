import { SerieRealizada } from './serie-realizada';
import { VeredictoSerie } from './veredicto';

export interface Balance {
  planificadas: number; 
  logradas: number; 
  cumplidas: number;
  superadas: number;
  porDebajo: number;
  distintas: number;
  sinHacer: number; 
  extras: number; 
  hechas: number; 
}

export function calcularBalance(series: readonly SerieRealizada[]): Balance {
  const b: Balance = {
    planificadas: 0, logradas: 0, cumplidas: 0, superadas: 0,
    porDebajo: 0, distintas: 0, sinHacer: 0, extras: 0, hechas: 0,
  };

  for (const s of series) {
    if (s.completada) b.hechas++;
    if (s.objetivo !== null) b.planificadas++;

    switch (s.veredicto()) {
      case VeredictoSerie.CUMPLIDA: b.cumplidas++; break;
      case VeredictoSerie.SUPERADA: b.superadas++; break;
      case VeredictoSerie.POR_DEBAJO: b.porDebajo++; break;
      case VeredictoSerie.DISTINTA: b.distintas++; break;
      case VeredictoSerie.EXTRA: b.extras++; break;
      case VeredictoSerie.SIN_HACER:
        if (s.objetivo !== null) b.sinHacer++; 
        break;
    }
  }
  b.logradas = b.cumplidas + b.superadas;
  return b;
}