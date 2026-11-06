import { EjercicioRealizado } from './ejercicio-realizado';
import { EjercicioInexistente, LimiteExcedido, RutinaNoEncontrada, SerieIncoherente } from './errores-rutina';
import {
  EjercicioDeSesionNoEncontrado,
  EjercicioSinSeriesEnSesion,
  RutinaNoIniciable,
  SesionAbandonadaNoCorregible,
  SesionFinalizadaSinSeries,
  SesionNoEnCurso,
  SesionSinSeriesCompletadas,
} from './errores-sesion';
import { EstadoSesion } from './estado-sesion';
import { LIMITES } from './limites';
import { OrigenRutina } from './origen-rutina';
import { Rutina, TiposDeMedicion } from './rutina';
import { DatosSerie, SeriePlanificada } from './serie-planificada';
import { Objetivo, SerieRealizada } from './serie-realizada';
import { validarFechaSesion } from './valores';

export interface DatosSerieReal extends DatosSerie {
  completada: boolean;
}
export interface DatosEjercicioReal {
  ejercicioId: string;
  omitido: boolean;
  series: DatosSerieReal[];
}

const objetivoDe = (s?: SeriePlanificada): Objetivo | null =>
  s ? { repeticiones: s.repeticiones, carga: s.carga, duracionSegundos: s.duracionSegundos } : null;

export class Sesion {
  private constructor(
    readonly id: string,
    readonly usuarioId: string,
    readonly rutinaId: string | null, 
    readonly nombreRutina: string | null, 
    private _fechaSesion: string, 
    readonly fechaRegistro: Date, 
    private _estado: EstadoSesion,
    private readonly _ejercicios: EjercicioRealizado[],
  ) {}

  static iniciar(id: string, usuarioId: string, hoy: string, ahora: Date, rutina: Rutina | null): Sesion {
    if (!rutina) {
      return new Sesion(id, usuarioId, null, null, hoy, ahora, EstadoSesion.EN_CURSO, []);
    }
    asegurarRutinaUsable(rutina, usuarioId);
    const ejercicios = rutina.ejercicios.map(
      (e) =>
        new EjercicioRealizado(
          e.orden,
          e.ejercicioId,
          false,
          e.series.map((s, i) => SerieRealizada.pendiente(i + 1, s)),
        ),
    );
    return new Sesion(id, usuarioId, rutina.id, rutina.nombre, hoy, ahora, EstadoSesion.EN_CURSO, ejercicios);
  }

  static registrarPasada(
    id: string,
    usuarioId: string,
    fechaSesion: string,
    hoy: string,
    ahora: Date,
    rutina: Rutina | null,
    ejercicios: DatosEjercicioReal[],
    tipos: TiposDeMedicion,
  ): Sesion {
    validarFechaSesion(fechaSesion, hoy);
    if (rutina) asegurarRutinaUsable(rutina, usuarioId);
    if (ejercicios.length > LIMITES.EJERCICIOS_POR_SESION) {
      throw new LimiteExcedido(`Una sesión admite hasta ${LIMITES.EJERCICIOS_POR_SESION} ejercicios.`);
    }

    const construidos = ejercicios.map((e, i) => {
      const tipo = tipos.get(e.ejercicioId);
      if (!tipo) throw new EjercicioInexistente(e.ejercicioId);
      if (e.series.length === 0) throw new EjercicioSinSeriesEnSesion(i + 1); // R19
      if (e.series.length > LIMITES.SERIES_POR_EJERCICIO) {
        throw new LimiteExcedido(`Un ejercicio admite hasta ${LIMITES.SERIES_POR_EJERCICIO} series.`);
      }
      if (e.omitido && e.series.some((s) => s.completada)) {
        throw new SerieIncoherente('Un ejercicio omitido no puede tener series completadas.');
      }
      const plan = rutina?.ejercicios.find((p) => p.orden === i + 1 && p.ejercicioId === e.ejercicioId);
      const series = e.series.map((s, j) =>
        SerieRealizada.crear(j + 1, s.completada, tipo, s, objetivoDe(plan?.series[j])),
      );
      return new EjercicioRealizado(i + 1, e.ejercicioId, e.omitido, series);
    });

    const sesion = new Sesion(
      id,
      usuarioId,
      rutina?.id ?? null,
      rutina?.nombre ?? null,
      fechaSesion,
      ahora,
      EstadoSesion.FINALIZADA,
      construidos,
    );
    sesion.asegurarInvariantesSiFinalizada(); 
    return sesion;
  }

  static reconstruir(
    id: string,
    usuarioId: string,
    rutinaId: string | null,
    nombreRutina: string | null,
    fechaSesion: string,
    fechaRegistro: Date,
    estado: EstadoSesion,
    ejercicios: EjercicioRealizado[],
  ): Sesion {
    return new Sesion(id, usuarioId, rutinaId, nombreRutina, fechaSesion, fechaRegistro, estado, ejercicios);
  }

  get fechaSesion(): string {
    return this._fechaSesion;
  }

  get estado(): EstadoSesion {
    return this._estado;
  }

  get ejercicios(): readonly EjercicioRealizado[] {
    return this._ejercicios;
  }

  cantidadSeriesCompletadas(): number {
    return this._ejercicios.reduce((n, e) => n + e.series.filter((s) => s.completada).length, 0);
  }

  agregarEjercicio(ejercicioId: string, tipos: TiposDeMedicion): void {
    this.asegurarEnCurso();
    if (!tipos.has(ejercicioId)) throw new EjercicioInexistente(ejercicioId);
    if (this._ejercicios.length >= LIMITES.EJERCICIOS_POR_SESION) {
      throw new LimiteExcedido(`Una sesión admite hasta ${LIMITES.EJERCICIOS_POR_SESION} ejercicios.`);
    }
    this._ejercicios.push(new EjercicioRealizado(this._ejercicios.length + 1, ejercicioId, false, []));
  }

  registrarSerie(orden: number, datos: DatosSerie, tipos: TiposDeMedicion): SerieRealizada {
    this.asegurarEnCurso();
    const ejercicio = this.ejercicioEn(orden);
    const tipo = tipos.get(ejercicio.ejercicioId);
    if (!tipo) throw new EjercicioInexistente(ejercicio.ejercicioId);
    return ejercicio.registrarSerie(tipo, datos);
  }

  omitirEjercicio(orden: number): EjercicioRealizado {
    this.asegurarEnCurso();
    const ejercicio = this.ejercicioEn(orden);
    ejercicio.omitir();
    return ejercicio;
  }

  finalizar(): void {
    this.asegurarEnCurso();
    if (!this._ejercicios.some((e) => e.series.some((s) => s.completada))) {
      throw new SesionSinSeriesCompletadas();
    }
    const sinSeries = this._ejercicios.find((e) => e.series.length === 0);
    if (sinSeries) throw new EjercicioSinSeriesEnSesion(sinSeries.orden);
    this._estado = EstadoSesion.FINALIZADA;
  }

  abandonar(): void {
    this.asegurarEnCurso();
    this._estado = EstadoSesion.ABANDONADA;
  }

  cambiarFecha(nueva: string, hoy: string): void {
    this.asegurarCorregible();
    validarFechaSesion(nueva, hoy);
    this._fechaSesion = nueva;
  }

  corregirSerie(
    ordenEjercicio: number,
    ordenSerie: number,
    completada: boolean,
    datos: DatosSerie,
    tipos: TiposDeMedicion,
  ): SerieRealizada {
    this.asegurarCorregible();
    const ejercicio = this.ejercicioEn(ordenEjercicio);
    const tipo = tipos.get(ejercicio.ejercicioId);
    if (!tipo) throw new EjercicioInexistente(ejercicio.ejercicioId);
    const serie = ejercicio.corregirSerie(ordenSerie, tipo, completada, datos);
    this.asegurarInvariantesSiFinalizada();
    return serie;
  }

  quitarSerie(ordenEjercicio: number, ordenSerie: number): void {
    this.asegurarCorregible();
    this.ejercicioEn(ordenEjercicio).quitarSerie(ordenSerie);
    this.asegurarInvariantesSiFinalizada();
  }

  quitarEjercicio(orden: number): void {
    this.asegurarCorregible();
    const i = this._ejercicios.findIndex((e) => e.orden === orden);
    if (i < 0) throw new EjercicioDeSesionNoEncontrado();
    const restantes = this._ejercicios
      .filter((_, k) => k !== i)
      .map((e, k) => new EjercicioRealizado(k + 1, e.ejercicioId, e.omitido, [...e.series]));
    this._ejercicios.splice(0, this._ejercicios.length, ...restantes);
    this.asegurarInvariantesSiFinalizada();
  }

  private asegurarEnCurso(): void {
    if (this._estado !== EstadoSesion.EN_CURSO) throw new SesionNoEnCurso();
  }

  private asegurarCorregible(): void {
    if (this._estado === EstadoSesion.ABANDONADA) throw new SesionAbandonadaNoCorregible();
  }

  private asegurarInvariantesSiFinalizada(): void {
    if (this._estado !== EstadoSesion.FINALIZADA) return;
    if (this.cantidadSeriesCompletadas() === 0) throw new SesionFinalizadaSinSeries();
    const sinSeries = this._ejercicios.find((e) => e.series.length === 0);
    if (sinSeries) throw new EjercicioSinSeriesEnSesion(sinSeries.orden);
  }

  private ejercicioEn(orden: number): EjercicioRealizado {
    const ejercicio = this._ejercicios.find((e) => e.orden === orden);
    if (!ejercicio) throw new EjercicioDeSesionNoEncontrado();
    return ejercicio;
  }
}

function asegurarRutinaUsable(rutina: Rutina, usuarioId: string): void {
  if (!rutina.esVisiblePor(usuarioId)) throw new RutinaNoEncontrada();
  if (rutina.origen === OrigenRutina.PREDEFINIDA) throw new RutinaNoIniciable();
}