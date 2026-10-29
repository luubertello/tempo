import { Email } from '../domain/email';
import { CredencialesInvalidas, EmailInvalido } from '../domain/errores';
import { EmisorDeTokens, HasheadorContrasena } from '../domain/puertos';
import { Usuario } from '../domain/usuario';
import { UsuarioRepositorio } from '../domain/usuario.repositorio';

// CU2
export class AutenticarCasoDeUso {
  constructor(
    private readonly usuarios: UsuarioRepositorio,
    private readonly hasheador: HasheadorContrasena,
    private readonly tokens: EmisorDeTokens,
  ) {}

  async ejecutar(entrada: { email: string; password: string }): Promise<string> {
    let usuario: Usuario | null = null;
    try {
      usuario = await this.usuarios.buscarPorEmail(Email.crear(entrada.email));
    } catch (e) {
      if (!(e instanceof EmailInvalido)) throw e; 
    }

    const coincide = usuario ? await this.hasheador.comparar(entrada.password, usuario.hashContrasena) : false;
    if (!usuario || !coincide) throw new CredencialesInvalidas();

    return this.tokens.emitir({ usuarioId: usuario.id, rol: usuario.rol });
  }
}