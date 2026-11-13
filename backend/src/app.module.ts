import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { CatalogoModule } from './catalogo/catalogo.module';
import { IdentidadModule } from './identidad/identidad.module';
import { ENTIDADES } from './entidades';
import { EntrenamientoModule } from './entrenamiento/entrenamiento.module';
import { EstadisticasModule } from './estadisticas/estadisticas.module';


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
        ssl: config.get<string>('DB_SSL') === 'true'
          ? { rejectUnauthorized: false }
          : false,
        entities: ENTIDADES,
        migrations: [join(__dirname, 'shared', 'migrations', '*.{ts,js}')],
        migrationsRun: true,
        synchronize: false,
      }),
    }),
    CatalogoModule,
    IdentidadModule,
    EntrenamientoModule,
    EstadisticasModule
  ],
})
export class AppModule {}