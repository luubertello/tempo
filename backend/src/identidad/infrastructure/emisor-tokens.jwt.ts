import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatosDelToken, EmisorDeTokens } from '../domain/puertos';

@Injectable()
export class EmisorDeTokensJwt extends EmisorDeTokens {
  constructor(private readonly jwt: JwtService) {
    super();
  }

  emitir(datos: DatosDelToken): Promise<string> {
    return this.jwt.signAsync({ sub: datos.usuarioId, rol: datos.rol });
  }
}