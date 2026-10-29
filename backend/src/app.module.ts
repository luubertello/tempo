import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { CatalogoModule } from './catalogo/catalogo.module';
import { IdentidadModule } from './identidad/identidad.module';
import { ENTIDADES } from './entidades';
import { CrearCatalogoEjercicios1793145600000 } from './shared/migrations/1793145600000-CrearCatalogoEjercicios';
import { CrearUsuarios1793232000000 } from './shared/migrations/1793232000000-CrearUsuarios';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.getOrThrow<string>('DB_HOST'),
        port: Number(config.getOrThrow('DB_PORT')),
        username: config.getOrThrow<string>('DB_USER'),
        password: config.getOrThrow<string>('DB_PASSWORD'),
        database: config.getOrThrow<string>('DB_NAME'),
        entities: ENTIDADES,
        migrations: [join(__dirname, 'shared', 'migrations', '*.{ts,js}')],
        migrationsRun: true,
        synchronize: false,
      }),
    }),
    CatalogoModule,
    IdentidadModule
  ],
})
export class AppModule {}