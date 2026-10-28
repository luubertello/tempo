import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListarEjerciciosCasoDeUso } from './application/listar-ejercicios.caso-de-uso.js';
import { EjercicioRepositorio } from './domain/ejercicio.repositorio.js';
import { EjercicioSchema } from './infrastructure/ejercicio.schema.js';
import { EjercicioRepositorioTypeOrm } from './infrastructure/ejercicio.repositorio.typeorm.js';
import { CatalogoController } from './presentation/catalogo.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([EjercicioSchema])],
  controllers: [CatalogoController],
  providers: [
    { provide: EjercicioRepositorio, useClass: EjercicioRepositorioTypeOrm },
    {
      provide: ListarEjerciciosCasoDeUso,
      useFactory: (repo: EjercicioRepositorio) => new ListarEjerciciosCasoDeUso(repo),
      inject: [EjercicioRepositorio],
    },
  ],
  exports: [EjercicioRepositorio],
})
export class CatalogoModule {}