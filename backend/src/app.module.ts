import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { CatalogoModule } from './catalogo/catalogo.module.js';
import { EjercicioSchema } from './catalogo/infrastructure/ejercicio.schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
        entities: [EjercicioSchema],
        migrations: [join(__dirname, 'compartido', 'migraciones', '*{.ts,.js}')],
        migrationsRun: true,
        synchronize: false,
      }),
    }),
    CatalogoModule,
  ],
})
export class AppModule {}