import { TipoMedicion } from "../../catalogo/domain/tipo-medicion";
import { SerieCompletadaPublicada } from "../../entrenamiento/published/sesiones-finalizadas";

export enum Unidad {
  KG = 'kg',
  REPS = 'reps',
  SEG = 'seg',
}

export function unidadDe(tipo: TipoMedicion): Unidad {
  switch (tipo) {
    case TipoMedicion.REPETICIONES_CON_CARGA:
      return Unidad.KG;
    case TipoMedicion.REPETICIONES_PESO_CORPORAL:
      return Unidad.REPS;
    case TipoMedicion.TIEMPO:
      return Unidad.SEG;
  }
}

export function valorDe(tipo: TipoMedicion, serie: SerieCompletadaPublicada): number | null {
  switch (tipo) {
    case TipoMedicion.REPETICIONES_CON_CARGA:
      return serie.carga;
    case TipoMedicion.REPETICIONES_PESO_CORPORAL:
      return serie.repeticiones;
    case TipoMedicion.TIEMPO:
      return serie.duracionSegundos;
  }
}