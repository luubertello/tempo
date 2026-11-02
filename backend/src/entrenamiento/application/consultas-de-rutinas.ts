import { RutinaNoEncontrada } from '../domain/errores-rutina';
import { Rutina } from '../domain/rutina';
import { RutinaRepositorio } from '../domain/rutina.repositorio';

// CU4
export class ListarRutinasPredefinidasCasoDeUso {
  constructor(private readonly rutinas: RutinaRepositorio) {}
  ejecutar(): Promise<Rutina[]> {
    return this.rutinas.listarPredefinidas();
  }
}

// CU5
export class ListarMisRutinasCasoDeUso {
  constructor(private readonly rutinas: RutinaRepositorio) {}
  ejecutar(e: { usuarioId: string }): Promise<Rutina[]> {
    return this.rutinas.listarPropias(e.usuarioId);
  }
}

// CU6
export class VerRutinaCasoDeUso {
  constructor(private readonly rutinas: RutinaRepositorio) {}

  async ejecutar(e: { usuarioId: string; rutinaId: string }): Promise<Rutina> {
    const rutina = await this.rutinas.buscarPorId(e.rutinaId);
    if (!rutina || !rutina.esVisiblePor(e.usuarioId)) throw new RutinaNoEncontrada();
    return rutina;
  }
}