import { randomUUID } from 'node:crypto';
import { RutinaNoEncontrada } from '../domain/errores';
import { Rutina } from '../domain/rutina';
import { RutinaRepositorio } from '../domain/rutina.repositorio';

// CU10 - regla: R9
export class UsarRutinaPredefinidaCasoDeUso {
  constructor(private readonly rutinas: RutinaRepositorio) {}

  async ejecutar(e: { usuarioId: string; rutinaId: string }): Promise<Rutina> {
    const original = await this.rutinas.buscarPorId(e.rutinaId);
    if (!original) throw new RutinaNoEncontrada();
    const copia = original.copiarComoPropia(randomUUID(), e.usuarioId);
    await this.rutinas.guardar(copia);
    return copia;
  }
}