import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutenticarCasoDeUso } from './application/autenticar.caso-de-uso';
import { RegistrarUsuarioCasoDeUso } from './application/registrar-usuario.caso-de-uso';
import { EmisorDeTokens, HasheadorContrasena } from './domain/puertos';
import { UsuarioRepositorio } from './domain/usuario.repositorio';
import { EmisorDeTokensJwt } from './infrastructure/emisor-tokens.jwt';
import { HasheadorBcrypt } from './infrastructure/hasheador.bcrypt';
import { JwtEstrategia } from './infrastructure/jwt.estrategia';
import { UsuarioRepositorioTypeOrm } from './infrastructure/usuario.repositorio.typeorm';
import { UsuarioSchema } from './infrastructure/usuario.schema';
import { AuthController } from './presentation/auth.controller';
import { JwtAuthGuard } from './presentation/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsuarioSchema]),
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.getOrThrow<string>('JWT_EXPIRES_IN') as JwtSignOptions['expiresIn'] },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    { provide: UsuarioRepositorio, useClass: UsuarioRepositorioTypeOrm },
    { provide: HasheadorContrasena, useClass: HasheadorBcrypt },
    { provide: EmisorDeTokens, useClass: EmisorDeTokensJwt },
    JwtEstrategia,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    {
      provide: RegistrarUsuarioCasoDeUso,
      useFactory: (u: UsuarioRepositorio, h: HasheadorContrasena) => new RegistrarUsuarioCasoDeUso(u, h),
      inject: [UsuarioRepositorio, HasheadorContrasena],
    },
    {
      provide: AutenticarCasoDeUso,
      useFactory: (u: UsuarioRepositorio, h: HasheadorContrasena, t: EmisorDeTokens) =>
        new AutenticarCasoDeUso(u, h, t),
      inject: [UsuarioRepositorio, HasheadorContrasena, EmisorDeTokens],
    },
  ],
})
export class IdentidadModule {}