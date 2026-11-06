import { randomUUID } from 'node:crypto';
import { CatalogoDeEjercicios } from '../domain/catalogo-de-ejercicios';
import { RutinaNoEncontrada } from '../domain/errores-rutina';
import { Reloj } from '../domain/reloj';
import { Rutina } from '../domain/rutina';
import { RutinaRepositorio } from '../domain/rutina.repositorio';
import { DatosEjercicioReal, Sesion } from '../domain/sesion';
import { FiltroSesiones, SesionRepositorio } from '../domain/sesion.repositorio';
import { DatosSerie } from '../domain/serie-planificada';
import { SerieRealizada } from '../domain/serie-realizada';
import { cargarSesionDe } from './cargar-sesion';

export class RegistrarSesionPasadaCasoDeUso {
  constructor(
    private readonly sesiones: SesionRepositorio,
    private readonly rutinas: RutinaRepositorio,
    private readonly catalogo: CatalogoDeEjercicios,
    private readonly reloj: Reloj,
  ) {}

  async ejecutar(e: {
    usuarioId: string;
    fechaSesion: string;
    rutinaId?: string;
    ejercicios: DatosEjercicioReal[];
  }): Promise<Sesion> {
    let rutina: Rutina | null = null;
    if (e.rutinaId) {
      rutina = await this.rutinas.buscarPorId(e.rutinaId);
      if (!rutina) throw new RutinaNoEncontrada();
    }
    const tipos = await this.catalogo.tiposDeMedicion(e.ejercicios.map((x) => x.ejercicioId));
    const sesion = Sesion.registrarPasada(
      randomUUID(),
      e.usuarioId,
      e.fechaSesion,
      this.reloj.hoy(),
      this.reloj.ahora(),
      rutina,
      e.ejercicios,
      tipos,
    );
    await this.sesiones.guardar(sesion);
    return sesion;
  }
}

export class CorregirSerieCasoDeUso {
  constructor(
    private readonly sesiones: SesionRepositorio,
    private readonly catalogo: CatalogoDeEjercicios,
  ) {}

  async ejecutar(e: {
    usuarioId: string;
    sesionId: string;
    ordenEjercicio: number;
    ordenSerie: number;
    completada: boolean;
    serie: DatosSerie;
  }): Promise<SerieRealizada> {
    const sesion = await cargarSesionDe(this.sesiones, e.usuarioId, e.sesionId);
    const tipos = await this.catalogo.tiposDeMedicion(sesion.ejercicios.map((x) => x.ejercicioId));
    const serie = sesion.corregirSerie(e.ordenEjercicio, e.ordenSerie, e.completada, e.serie, tipos);
    await this.sesiones.guardar(sesion);
    return serie;
  }
}

export class QuitarSerieCasoDeUso {
  constructor(private readonly sesiones: SesionRepositorio) {}

  async ejecutar(e: { usuarioId: string; sesionId: string; ordenEjercicio: number; ordenSerie: number }): Promise<void> {
    const sesion = await cargarSesionDe(this.sesiones, e.usuarioId, e.sesionId);
    sesion.quitarSerie(e.ordenEjercicio, e.ordenSerie);
    await this.sesiones.guardar(sesion);
  }
}

export class QuitarEjercicioCasoDeUso {
  constructor(private readonly sesiones: SesionRepositorio) {}

  async ejecutar(e: { usuarioId: string; sesionId: string; ordenEjercicio: number }): Promise<void> {
    const sesion = await cargarSesionDe(this.sesiones, e.usuarioId, e.sesionId);
    sesion.quitarEjercicio(e.ordenEjercicio);
    await this.sesiones.guardar(sesion);
  }
}

export class CambiarFechaDeSesionCasoDeUso {
  constructor(
    private readonly sesiones: SesionRepositorio,
    private readonly reloj: Reloj,
  ) {}

  async ejecutar(e: { usuarioId: string; sesionId: string; fechaSesion: string }): Promise<Sesion> {
    const sesion = await cargarSesionDe(this.sesiones, e.usuarioId, e.sesionId);
    sesion.cambiarFecha(e.fechaSesion, this.reloj.hoy());
    await this.sesiones.guardar(sesion);
    return sesion;
  }
}

export class EliminarSesionCasoDeUso {
  constructor(private readonly sesiones: SesionRepositorio) {}

  async ejecutar(e: { usuarioId: string; sesionId: string }): Promise<void> {
    const sesion = await cargarSesionDe(this.sesiones, e.usuarioId, e.sesionId);
    await this.sesiones.eliminar(sesion.id);
  }
}

export class ListarHistorialCasoDeUso {
  constructor(private readonly sesiones: SesionRepositorio) {}

  ejecutar(e: { usuarioId: string; filtro: FiltroSesiones }): Promise<Sesion[]> {
    return this.sesiones.listar(e.usuarioId, e.filtro);
  }
}