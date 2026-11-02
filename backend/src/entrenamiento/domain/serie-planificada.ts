import { TipoMedicion } from '../../catalogo/domain/tipo-medicion';
import { SerieIncoherente } from './errores';
import { validarCarga, validarDuracion, validarRepeticiones } from './valores';

export interface DatosSerie {
  repeticiones?: number | null;
  carga?: number | null;
  duracionSegundos?: number | null;
}

// Value object. R6 (con la carga objetivo opcional)
export class SeriePlanificada {
  private constructor(
    readonly repeticiones: number | null,
    readonly carga: number | null,
    readonly duracionSegundos: number | null,
  ) {}

  static crear(tipo: TipoMedicion, d: DatosSerie): SeriePlanificada {
    const rep = d.repeticiones ?? null;
    const carga = d.carga ?? null;
    const dur = d.duracionSegundos ?? null;

    switch (tipo) {
      case TipoMedicion.REPETICIONES_CON_CARGA:
        if (rep === null) throw new SerieIncoherente('Este ejercicio exige repeticiones.');
        if (dur !== null) throw new SerieIncoherente('Este ejercicio no admite duración.');
        break; // la carga objetivo es opcional en el plan
      case TipoMedicion.REPETICIONES_PESO_CORPORAL:
        if (rep === null) throw new SerieIncoherente('Este ejercicio exige repeticiones.');
        if (carga !== null || dur !== null) throw new SerieIncoherente('Este ejercicio no admite carga ni duración.');
        break;
      case TipoMedicion.TIEMPO:
        if (dur === null) throw new SerieIncoherente('Este ejercicio exige duración.');
        if (rep !== null || carga !== null) throw new SerieIncoherente('Este ejercicio no admite repeticiones ni carga.');
        break;
    }

    if (rep !== null) validarRepeticiones(rep);
    if (carga !== null) validarCarga(carga);
    if (dur !== null) validarDuracion(dur);
    return new SeriePlanificada(rep, carga, dur);
  }

  static reconstruir(rep: number | null, carga: number | null, dur: number | null): SeriePlanificada {
    return new SeriePlanificada(rep, carga, dur);
  }
}