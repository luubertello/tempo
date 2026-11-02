import { randomUUID } from 'node:crypto';
import { RutinaNoEncontrada } from '../domain/errores-rutina';
import { SesionEnCursoExistente } from '../domain/errores-sesion';
import { Reloj } from '../domain/reloj';
import { Rutina } from '../domain/rutina';
import { RutinaRepositorio } from '../domain/rutina.repositorio';
import { Sesion } from '../domain/sesion';
import { SesionRepositorio } from '../domain/sesion.repositorio';

// CU11 - reglas: R12, R15, R16
export class IniciarSesionCasoDeUso {
  constructor(
    private readonly sesiones: SesionRepositorio,
    private readonly rutinas: RutinaRepositorio,
    private readonly reloj: Reloj,
  ) {}

  async ejecutar(e: { usuarioId: string; rutinaId?: string }): Promise<Sesion> {
    let rutina: Rutina | null = null;
    if (e.rutinaId) {
      rutina = await this.rutinas.buscarPorId(e.rutinaId);
      if (!rutina) throw new RutinaNoEncontrada();
    }
    if (await this.sesiones.buscarEnCurso(e.usuarioId)) throw new SesionEnCursoExistente();

    const sesion = Sesion.iniciar(randomUUID(), e.usuarioId, this.reloj.hoy(), this.reloj.ahora(), rutina);
    await this.sesiones.guardar(sesion); 
    return sesion;
  }
}