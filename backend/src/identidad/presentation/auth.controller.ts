import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { Publico } from '../../shared/presentation/publico.decorator';
import { AutenticarCasoDeUso } from '../application/autenticar.caso-de-uso';
import { RegistrarUsuarioCasoDeUso } from '../application/registrar-usuario.caso-de-uso';
import { LoginDto, RegistroDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registrar: RegistrarUsuarioCasoDeUso,
    private readonly autenticar: AutenticarCasoDeUso,
  ) {}

  @Publico()
  @Post('registro') 
  async registro(@Body() dto: RegistroDto) {
    const u = await this.registrar.ejecutar(dto);
    return { id: u.id, email: u.email.valor, rol: u.rol };
  }

  @Publico()
  @HttpCode(200)
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const token = await this.autenticar.ejecutar(dto);
    return { token };
  }
}