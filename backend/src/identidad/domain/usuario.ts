import { Email } from './email';
import { Rol } from './rol';

export class Usuario {
  private constructor(
    readonly id: string,
    readonly email: Email,
    readonly hashContrasena: string,
    readonly rol: Rol,
  ) {}

  static registrar(id: string, email: Email, hashContrasena: string): Usuario {
    return new Usuario(id, email, hashContrasena, Rol.USUARIO);
  }

  static reconstruir(id: string, email: Email, hashContrasena: string, rol: Rol): Usuario {
    return new Usuario(id, email, hashContrasena, rol);
  }
}