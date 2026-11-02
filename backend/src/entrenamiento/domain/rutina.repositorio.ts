import { Rutina } from './rutina';

export abstract class RutinaRepositorio {
  abstract buscarPorId(id: string): Promise<Rutina | null>;
  abstract listarPropias(usuarioId: string): Promise<Rutina[]>;
  abstract listarPredefinidas(): Promise<Rutina[]>;
  abstract guardar(rutina: Rutina): Promise<void>; 
  abstract eliminar(id: string): Promise<void>;
}