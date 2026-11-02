import { TipoMedicion } from '../../catalogo/domain/tipo-medicion';
import { SerieIncoherente } from './errores-rutina';
import { DatosSerie, SeriePlanificada } from './serie-planificada';
import { validarCarga, validarDuracion, validarRepeticiones } from './valores';

export interface Objetivo {
  repeticiones: number | null;
  carga: number | null;
  duracionSegundos: number | null;
}

interface ValoresReales {
  repeticiones: number | null;
  carga: number | null;
  duracionSegundos: number | null;
}

function validarReales(tipo: TipoMedicion, d: DatosSerie): ValoresReales {
  const rep = d.repeticiones ?? null;
  const carga = d.carga ?? null;
  const dur = d.duracionSegundos ?? null;

  switch (tipo) {
    case TipoMedicion.REPETICIONES_CON_CARGA:
      if (rep === null) throw new SerieIncoherente('Este ejercicio exige repeticiones.');
      if (carga === null) throw new SerieIncoherente('Este ejercicio exige carga.');
      if (dur !== null) throw new SerieIncoherente('Este ejercicio no admite duración.');
      break;
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
  return { repeticiones: rep, carga, duracionSegundos: dur };
}

export class SerieRealizada {
  private constructor(
    readonly orden: number,
    readonly completada: boolean,
    readonly repeticiones: number | null,
    readonly carga: number | null,
    readonly duracionSegundos: number | null,
    readonly objetivo: Objetivo | null,
  ) {}

  static pendiente(orden: number, plan: SeriePlanificada): SerieRealizada {
    return new SerieRealizada(orden, false, null, null, null, {
      repeticiones: plan.repeticiones,
      carga: plan.carga,
      duracionSegundos: plan.duracionSegundos,
    });
  }

  static libre(orden: number, tipo: TipoMedicion, datos: DatosSerie): SerieRealizada {
    const v = validarReales(tipo, datos);
    return new SerieRealizada(orden, true, v.repeticiones, v.carga, v.duracionSegundos, null);
  }

  static reconstruir(
    orden: number,
    completada: boolean,
    repeticiones: number | null,
    carga: number | null,
    duracionSegundos: number | null,
    objetivo: Objetivo | null,
  ): SerieRealizada {
    return new SerieRealizada(orden, completada, repeticiones, carga, duracionSegundos, objetivo);
  }

  completar(tipo: TipoMedicion, datos: DatosSerie): SerieRealizada {
    const v = validarReales(tipo, datos);
    return new SerieRealizada(this.orden, true, v.repeticiones, v.carga, v.duracionSegundos, this.objetivo);
  }

  sinValores(): SerieRealizada {
    return new SerieRealizada(this.orden, false, null, null, null, this.objetivo);
  }

  cumpleObjetivo(): boolean {
    if (!this.completada || !this.objetivo) return false;
    const o = this.objetivo;
    return (
      (o.repeticiones === null || o.repeticiones === this.repeticiones) &&
      (o.carga === null || o.carga === this.carga) &&
      (o.duracionSegundos === null || o.duracionSegundos === this.duracionSegundos)
    );
  }
}