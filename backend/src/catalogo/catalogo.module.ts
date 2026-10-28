import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListarEjerciciosCasoDeUso } from './aplicacion/listar-ejercicios.caso-de-uso.js';
import { EjercicioRepositorio } from './dominio/ejercicio.repositorio.js';
import { EjercicioSchema } from './infraestructura/ejercicio.schema.js';
import { EjercicioRepositorioTypeOrm } from './infraestructura/ejercicio.repositorio.typeorm.js';
import { CatalogoController } from './presentacion/catalogo.controller.js';

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