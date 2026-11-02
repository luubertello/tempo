import { NoHaySesionEnCurso } from '../domain/errores-sesion';
import { Sesion } from '../domain/sesion';
import { SesionRepositorio } from '../domain/sesion.repositorio';
import { cargarSesionDe } from './cargar-sesion';

// CU20
export class VerSesionEnCursoCasoDeUso {
  constructor(private readonly sesiones: SesionRepositorio) {}

  async ejecutar(e: { usuarioId: string }): Promise<Sesion> {
    const sesion = await this.sesiones.buscarEnCurso(e.usuarioId);
    if (!sesion) throw new NoHaySesionEnCurso();
    return sesion;
  }
}

// CU22
export class VerSesionCasoDeUso {
  constructor(private readonly sesiones: SesionRepositorio) {}

  ejecutar(e: { usuarioId: string; sesionId: string }): Promise<Sesion> {
    return cargarSesionDe(this.sesiones, e.usuarioId, e.sesionId);
  }
}