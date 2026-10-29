import { randomUUID } from 'node:crypto';
import { Email } from '../domain/email';
import { EmailYaRegistrado } from '../domain/errores';
import { HasheadorContrasena } from '../domain/puertos';
import { Usuario } from '../domain/usuario';
import { UsuarioRepositorio } from '../domain/usuario.repositorio';

// CU1 
export class RegistrarUsuarioCasoDeUso {
  constructor(
    private readonly usuarios: UsuarioRepositorio,
    private readonly hasheador: HasheadorContrasena,
  ) {}

  async ejecutar(entrada: { email: string; password: string }): Promise<Usuario> {
    const email = Email.crear(entrada.email);
    if (await this.usuarios.buscarPorEmail(email)) throw new EmailYaRegistrado();

    const hash = await this.hasheador.hashear(entrada.password);
    const usuario = Usuario.registrar(randomUUID(), email, hash);
    await this.usuarios.guardar(usuario);
    return usuario;
  }
}