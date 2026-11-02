import { RutinaNoEncontrada } from "../domain/errores-rutina";
import { RutinaRepositorio } from '../domain/rutina.repositorio';

// CU9 - reglas: R8, R10
export class EliminarRutinaCasoDeUso {
  constructor(private readonly rutinas: RutinaRepositorio) {}

  async ejecutar(e: { usuarioId: string; rutinaId: string }): Promise<void> {
    const rutina = await this.rutinas.buscarPorId(e.rutinaId);
    if (!rutina) throw new RutinaNoEncontrada();
    rutina.asegurarEditablePor(e.usuarioId);
    await this.rutinas.eliminar(rutina.id);
  }
}