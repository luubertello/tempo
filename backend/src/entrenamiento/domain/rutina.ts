import { TipoMedicion } from '../../catalogo/domain/tipo-medicion';
import {
  EjercicioInexistente,
  EjercicioSinSeries,
  LimiteExcedido,
  NombreDeRutinaInvalido,
  RutinaNoEncontrada,
  RutinaPredefinidaNoModificable,
  RutinaSinEjercicios,
} from './errores';
import { LIMITES } from './limites';
import { OrigenRutina } from './origen-rutina';
import { DatosSerie, SeriePlanificada } from './serie-planificada';

export type TiposDeMedicion = ReadonlyMap<string, TipoMedicion>;

export interface DatosEjercicio {
  ejercicioId: string;
  series: DatosSerie[];
}

export class EjercicioPlanificado {
  constructor(
    readonly orden: number,
    readonly ejercicioId: string,
    readonly series: readonly SeriePlanificada[],
  ) {}
}

export class Rutina {
  private constructor(
    readonly id: string,
    readonly usuarioId: string | null, // R1: nulo si es predefinida
    readonly nombre: string,
    readonly origen: OrigenRutina,
    readonly ejercicios: readonly EjercicioPlanificado[],
  ) {}

  static crearPropia(
    id: string,
    usuarioId: string,
    nombre: string,
    ejercicios: DatosEjercicio[],
    tipos: TiposDeMedicion,
  ): Rutina {
    return new Rutina(id, usuarioId, normalizarNombre(nombre), OrigenRutina.PROPIA, construirEjercicios(ejercicios, tipos));
  }

  static reconstruir(
    id: string,
    usuarioId: string | null,
    nombre: string,
    origen: OrigenRutina,
    ejercicios: EjercicioPlanificado[],
  ): Rutina {
    return new Rutina(id, usuarioId, nombre, origen, ejercicios);
  }

  esVisiblePor(usuarioId: string): boolean {
    return this.origen === OrigenRutina.PREDEFINIDA || this.usuarioId === usuarioId;
  }

  asegurarEditablePor(usuarioId: string): void {
    if (!this.esVisiblePor(usuarioId)) throw new RutinaNoEncontrada();
    if (this.origen === OrigenRutina.PREDEFINIDA) throw new RutinaPredefinidaNoModificable();
  }

  modificar(usuarioId: string, nombre: string, ejercicios: DatosEjercicio[], tipos: TiposDeMedicion): Rutina {
    this.asegurarEditablePor(usuarioId);
    return new Rutina(this.id, this.usuarioId, normalizarNombre(nombre), this.origen, construirEjercicios(ejercicios, tipos));
  }

  copiarComoPropia(nuevoId: string, usuarioId: string): Rutina {
    if (this.origen !== OrigenRutina.PREDEFINIDA) throw new RutinaNoEncontrada();
    return new Rutina(nuevoId, usuarioId, this.nombre, OrigenRutina.PROPIA, this.ejercicios);
  }
}

// R2
function normalizarNombre(crudo: string): string {
  const nombre = (crudo ?? '').trim();
  if (nombre.length === 0 || nombre.length > LIMITES.NOMBRE_MAX) throw new NombreDeRutinaInvalido(LIMITES.NOMBRE_MAX);
  return nombre;
}

// R3, R4, R5, R6, R7
function construirEjercicios(datos: DatosEjercicio[], tipos: TiposDeMedicion): EjercicioPlanificado[] {
  if (datos.length === 0) throw new RutinaSinEjercicios();
  if (datos.length > LIMITES.EJERCICIOS_POR_RUTINA) {
    throw new LimiteExcedido(`Una rutina admite hasta ${LIMITES.EJERCICIOS_POR_RUTINA} ejercicios.`);
  }
  return datos.map((e, i) => {
    const tipo = tipos.get(e.ejercicioId);
    if (!tipo) throw new EjercicioInexistente(e.ejercicioId);
    if (e.series.length === 0) throw new EjercicioSinSeries();
    if (e.series.length > LIMITES.SERIES_POR_EJERCICIO) {
      throw new LimiteExcedido(`Un ejercicio admite hasta ${LIMITES.SERIES_POR_EJERCICIO} series.`);
    }
    return new EjercicioPlanificado(i + 1, e.ejercicioId, e.series.map((s) => SeriePlanificada.crear(tipo, s)));
  });
}