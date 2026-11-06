import { TipoMedicion } from '../../catalogo/domain/tipo-medicion';
import { EjercicioSinSeriesEnSesion, SerieNoEncontrada } from './errores-sesion';
import { LimiteExcedido } from './errores-rutina';
import { LIMITES } from './limites';
import { DatosSerie } from './serie-planificada';
import { SerieRealizada } from './serie-realizada';

export enum ResultadoEjercicio {
  OMITIDO = 'OMITIDO',
  CUMPLIDO = 'CUMPLIDO',
  MODIFICADO = 'MODIFICADO',
  SIN_PLAN = 'SIN_PLAN',
  PENDIENTE = 'PENDIENTE',
}

export class EjercicioRealizado {
  constructor(
    readonly orden: number,
    readonly ejercicioId: string,
    private _omitido: boolean,
    private _series: SerieRealizada[],
  ) {}

  get omitido(): boolean {
    return this._omitido;
  }

  get series(): readonly SerieRealizada[] {
    return this._series;
  }

  resultado(): ResultadoEjercicio {
    if (this._omitido) return ResultadoEjercicio.OMITIDO;
    if (this._series.length > 0 && !this._series.some((s) => s.completada)) {
        return this._series.some((s) => s.objetivo !== null)
            ? ResultadoEjercicio.PENDIENTE
            : ResultadoEjercicio.SIN_PLAN;
        }
    const conObjetivo = this._series.filter((s) => s.objetivo !== null);
    if (conObjetivo.length === 0) return ResultadoEjercicio.SIN_PLAN;
    if (conObjetivo.length !== this._series.length) return ResultadoEjercicio.MODIFICADO; // series extra
    return this._series.every((s) => s.cumpleObjetivo()) ? ResultadoEjercicio.CUMPLIDO : ResultadoEjercicio.MODIFICADO;
  }

  registrarSerie(tipo: TipoMedicion, datos: DatosSerie): SerieRealizada {
    const i = this._series.findIndex((s) => !s.completada);
    let serie: SerieRealizada;
    if (i >= 0) {
      serie = this._series[i].completar(tipo, datos);
      this._series[i] = serie;
    } else {
      if (this._series.length >= LIMITES.SERIES_POR_EJERCICIO) {
        throw new LimiteExcedido(`Un ejercicio admite hasta ${LIMITES.SERIES_POR_EJERCICIO} series.`);
      }
      serie = SerieRealizada.libre(this._series.length + 1, tipo, datos);
      this._series.push(serie);
    }
    this._omitido = false; 
    return serie;
  }

  corregirSerie(ordenSerie: number, tipo: TipoMedicion, completada: boolean, datos: DatosSerie): SerieRealizada {
    const i = this._series.findIndex((s) => s.orden === ordenSerie);
    if (i < 0) throw new SerieNoEncontrada();
    const nueva = completada ? this._series[i].completar(tipo, datos) : this._series[i].marcarNoHecha(datos);
    this._series[i] = nueva;
    if (completada) this._omitido = false; 
    return nueva;
  }


  quitarSerie(ordenSerie: number): void {
    const i = this._series.findIndex((s) => s.orden === ordenSerie);
    if (i < 0) throw new SerieNoEncontrada();
    this._series.splice(i, 1);
    this._series = this._series.map((s, k) => s.conOrden(k + 1));
  }

  omitir(): void {
    if (this._series.length === 0) throw new EjercicioSinSeriesEnSesion(this.orden);
    this._series = this._series.map((s) => s.sinValores());
    this._omitido = true;
  }
}