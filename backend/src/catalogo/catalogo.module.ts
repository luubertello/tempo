import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListarEjerciciosCasoDeUso } from './application/listar-ejercicios.caso-de-uso';
import { EjercicioRepositorio } from './domain/ejercicio.repositorio';
import { EjercicioSchema } from './infrastructure/ejercicio.schema';
import { EjercicioRepositorioTypeOrm } from './infrastructure/ejercicio.repositorio.typeorm';
import { CatalogoController } from './presentation/catalogo.controller';

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