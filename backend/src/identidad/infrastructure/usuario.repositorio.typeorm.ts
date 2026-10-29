import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Email } from '../domain/email';
import { EmailYaRegistrado } from '../domain/errores';
import { Rol } from '../domain/rol';
import { Usuario } from '../domain/usuario';
import { UsuarioRepositorio } from '../domain/usuario.repositorio';
import { UsuarioFila, UsuarioSchema } from './usuario.schema';

const VIOLACION_UNIQUE_PG = '23505';

@Injectable()
export class UsuarioRepositorioTypeOrm extends UsuarioRepositorio {
  constructor(
    @InjectRepository(UsuarioSchema)
    private readonly repo: Repository<UsuarioFila>,
  ) {
    super();
  }

  async buscarPorEmail(email: Email): Promise<Usuario | null> {
    const fila = await this.repo.findOneBy({ email: email.valor });
    return fila ? this.adomain(fila) : null;
  }

  async guardar(usuario: Usuario): Promise<void> {
    try {
      await this.repo.insert({
        id: usuario.id,
        email: usuario.email.valor,
        hashContrasena: usuario.hashContrasena,
        rol: usuario.rol,
      });
    } catch (e) {
      if (e instanceof QueryFailedError && (e.driverError as { code?: string })?.code === VIOLACION_UNIQUE_PG) {
        throw new EmailYaRegistrado();
      }
      throw e;
    }
  }

  private adomain(f: UsuarioFila): Usuario {
    return Usuario.reconstruir(f.id, Email.crear(f.email), f.hashContrasena, f.rol as Rol);
  }
}