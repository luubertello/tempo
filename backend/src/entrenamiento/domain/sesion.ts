import { EjercicioRealizado } from './ejercicio-realizado';
import { EjercicioInexistente, LimiteExcedido, RutinaNoEncontrada } from './errores-rutina';
import {
  EjercicioDeSesionNoEncontrado,
  EjercicioSinSeriesEnSesion,
  RutinaNoIniciable,
  SesionNoEnCurso,
  SesionSinSeriesCompletadas,
} from './errores-sesion';
import { EstadoSesion } from './estado-sesion';
import { LIMITES } from './limites';
import { OrigenRutina } from './origen-rutina';
import { Rutina, TiposDeMedicion } from './rutina';
import { DatosSerie } from './serie-planificada';
import { SerieRealizada } from './serie-realizada';


export class Sesion {
  private constructor(
    readonly id: string,
    readonly usuarioId: string,
    readonly rutinaId: string | null, 
    readonly nombreRutina: string | null, 
    readonly fechaSesion: string, 
    readonly fechaRegistro: Date, 
    private _estado: EstadoSesion,
    private readonly _ejercicios: EjercicioRealizado[],
  ) {}

  static iniciar(
    id: string,
    usuarioId: string,
    hoy: string,
    ahora: Date,
    rutina: Rutina | null,
  ): Sesion {
    if (!rutina) {
      return new Sesion(id, usuarioId, null, null, hoy, ahora, EstadoSesion.EN_CURSO, []);
    }
    if (!rutina.esVisiblePor(usuarioId)) throw new RutinaNoEncontrada(); // ajena -> 404
    if (rutina.origen === OrigenRutina.PREDEFINIDA) throw new RutinaNoIniciable();

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

  get estado(): EstadoSesion {
    return this._estado;
  }

  get ejercicios(): readonly EjercicioRealizado[] {
    return this._ejercicios;
  }

  // R7, R17, R18
  agregarEjercicio(ejercicioId: string, tipos: TiposDeMedicion): void {
    this.asegurarEnCurso();
    if (!tipos.has(ejercicioId)) throw new EjercicioInexistente(ejercicioId);
    if (this._ejercicios.length >= LIMITES.EJERCICIOS_POR_SESION) {
      throw new LimiteExcedido(`Una sesión admite hasta ${LIMITES.EJERCICIOS_POR_SESION} ejercicios.`);
    }
    this._ejercicios.push(new EjercicioRealizado(this._ejercicios.length + 1, ejercicioId, false, []));
  }

  // R17, R19, R20
  registrarSerie(orden: number, datos: DatosSerie, tipos: TiposDeMedicion): SerieRealizada {
    this.asegurarEnCurso();
    const ejercicio = this.ejercicioEn(orden);
    const tipo = tipos.get(ejercicio.ejercicioId);
    if (!tipo) throw new EjercicioInexistente(ejercicio.ejercicioId);
    return ejercicio.registrarSerie(tipo, datos);
  }

  // R17, R19
  omitirEjercicio(orden: number): EjercicioRealizado {
    this.asegurarEnCurso();
    const ejercicio = this.ejercicioEn(orden);
    ejercicio.omitir();
    return ejercicio;
  }

  // R17, R19, R22
  finalizar(): void {
    this.asegurarEnCurso();
    if (!this._ejercicios.some((e) => e.series.some((s) => s.completada))) {
      throw new SesionSinSeriesCompletadas();
    }
    const sinSeries = this._ejercicios.find((e) => e.series.length === 0);
    if (sinSeries) throw new EjercicioSinSeriesEnSesion(sinSeries.orden);
    this._estado = EstadoSesion.FINALIZADA;
  }

  // R17
  abandonar(): void {
    this.asegurarEnCurso();
    this._estado = EstadoSesion.ABANDONADA;
  }

  private asegurarEnCurso(): void {
    if (this._estado !== EstadoSesion.EN_CURSO) throw new SesionNoEnCurso();
  }

  private ejercicioEn(orden: number): EjercicioRealizado {
    const ejercicio = this._ejercicios.find((e) => e.orden === orden);
    if (!ejercicio) throw new EjercicioDeSesionNoEncontrado();
    return ejercicio;
  }
}