import { Sesion } from './sesion';

export abstract class SesionRepositorio {
  abstract buscarPorId(id: string): Promise<Sesion | null>;
  abstract buscarEnCurso(usuarioId: string): Promise<Sesion | null>;
  abstract guardar(sesion: Sesion): Promise<void>;
}