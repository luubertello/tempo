import { CatalogoDeEjercicios } from '../domain/catalogo-de-ejercicios';
import { EjercicioRealizado } from '../domain/ejercicio-realizado';
import { Sesion } from '../domain/sesion';
import { SesionRepositorio } from '../domain/sesion.repositorio';
import { DatosSerie } from '../domain/serie-planificada';
import { SerieRealizada } from '../domain/serie-realizada';
import { cargarSesionDe } from './cargar-sesion';

// CU13 - reglas: R7, R17
export class AgregarEjercicioASesionCasoDeUso {
  constructor(
    private readonly sesiones: SesionRepositorio,
    private readonly catalogo: CatalogoDeEjercicios,
  ) {}

  async ejecutar(e: { usuarioId: string; sesionId: string; ejercicioId: string }): Promise<Sesion> {
    const sesion = await cargarSesionDe(this.sesiones, e.usuarioId, e.sesionId);
    const tipos = await this.catalogo.tiposDeMedicion([e.ejercicioId]);
    sesion.agregarEjercicio(e.ejercicioId, tipos);
    await this.sesiones.guardar(sesion); 
    return sesion;
  }
}

// CU14 - reglas: R17, R19, R20
export class RegistrarSerieCasoDeUso {
  constructor(
    private readonly sesiones: SesionRepositorio,
    private readonly catalogo: CatalogoDeEjercicios,
  ) {}

  async ejecutar(e: { usuarioId: string; sesionId: string; orden: number; serie: DatosSerie }): Promise<SerieRealizada> {
    const sesion = await cargarSesionDe(this.sesiones, e.usuarioId, e.sesionId);
    const tipos = await this.catalogo.tiposDeMedicion(sesion.ejercicios.map((x) => x.ejercicioId));
    const serie = sesion.registrarSerie(e.orden, e.serie, tipos);
    await this.sesiones.guardar(sesion);
    return serie;
  }
}

// CU15 - reglas: R17, R19
export class OmitirEjercicioCasoDeUso {
  constructor(private readonly sesiones: SesionRepositorio) {}

  async ejecutar(e: { usuarioId: string; sesionId: string; orden: number }): Promise<EjercicioRealizado> {
    const sesion = await cargarSesionDe(this.sesiones, e.usuarioId, e.sesionId);
    const ejercicio = sesion.omitirEjercicio(e.orden);
    await this.sesiones.guardar(sesion);
    return ejercicio;
  }
}

// CU17 - reglas: R17, R19, R22
export class FinalizarSesionCasoDeUso {
  constructor(private readonly sesiones: SesionRepositorio) {}

  async ejecutar(e: { usuarioId: string; sesionId: string }): Promise<Sesion> {
    const sesion = await cargarSesionDe(this.sesiones, e.usuarioId, e.sesionId);
    sesion.finalizar();
    await this.sesiones.guardar(sesion);
    return sesion;
  }
}

// CU18 - regla: R17. 
export class AbandonarSesionCasoDeUso {
  constructor(private readonly sesiones: SesionRepositorio) {}

  async ejecutar(e: { usuarioId: string; sesionId: string }): Promise<Sesion> {
    const sesion = await cargarSesionDe(this.sesiones, e.usuarioId, e.sesionId);
    sesion.abandonar();
    await this.sesiones.guardar(sesion);
    return sesion;
  }
}