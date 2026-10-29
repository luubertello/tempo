import { Email } from './email';
import { Usuario } from './usuario';

export abstract class UsuarioRepositorio {
  abstract buscarPorEmail(email: Email): Promise<Usuario | null>;
  // Lanza EmailYaRegistrado si el email ya existe
  abstract guardar(usuario: Usuario): Promise<void>;
}