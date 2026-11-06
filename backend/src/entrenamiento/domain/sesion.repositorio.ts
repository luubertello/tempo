import { EstadoSesion } from './estado-sesion';
import { Sesion } from './sesion';

export interface FiltroSesiones {
  estado?: EstadoSesion;
  desde?: string; 
  hasta?: string; 
}

export abstract class SesionRepositorio {
  abstract buscarPorId(id: string): Promise<Sesion | null>;
  abstract buscarEnCurso(usuarioId: string): Promise<Sesion | null>;
  abstract listar(usuarioId: string, filtro: FiltroSesiones): Promise<Sesion[]>;
  abstract guardar(sesion: Sesion): Promise<void>;
  abstract eliminar(id: string): Promise<void>;
}