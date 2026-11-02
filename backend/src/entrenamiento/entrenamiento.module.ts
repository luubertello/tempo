import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EjercicioRepositorio } from '../catalogo/domain/ejercicio.repositorio';
import { CatalogoModule } from '../catalogo/catalogo.module';
import { ListarMisRutinasCasoDeUso, ListarRutinasPredefinidasCasoDeUso, VerRutinaCasoDeUso } from './application/consultas-de-rutinas';
import { CrearRutinaCasoDeUso } from './application/crear-rutina.caso-de-uso';
import { EliminarRutinaCasoDeUso } from './application/eliminar-rutina.caso-de-uso';
import { ModificarRutinaCasoDeUso } from './application/modificar-rutina.caso-de-uso';
import { UsarRutinaPredefinidaCasoDeUso } from './application/usar-rutina-predefinida.caso-de-uso';
import { CatalogoDeEjercicios } from './domain/catalogo-de-ejercicios';
import { RutinaRepositorio } from './domain/rutina.repositorio';
import { CatalogoAdaptador } from './infrastructure/catalogo.adaptador';
import { RutinaRepositorioTypeOrm } from './infrastructure/rutina.repositorio.typeorm';
import { RutinaEjercicioSchema, RutinaSchema, RutinaSerieSchema } from './infrastructure/rutina.schemas';
import { RutinasController } from './presentation/rutinas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RutinaSchema, RutinaEjercicioSchema, RutinaSerieSchema]), CatalogoModule],
  controllers: [RutinasController],
  providers: [
    { provide: RutinaRepositorio, useClass: RutinaRepositorioTypeOrm },
    {
      provide: CatalogoDeEjercicios,
      useFactory: (e: EjercicioRepositorio) => new CatalogoAdaptador(e),
      inject: [EjercicioRepositorio],
    },
    { provide: ListarRutinasPredefinidasCasoDeUso, useFactory: (r: RutinaRepositorio) => new ListarRutinasPredefinidasCasoDeUso(r), inject: [RutinaRepositorio] },
    { provide: ListarMisRutinasCasoDeUso, useFactory: (r: RutinaRepositorio) => new ListarMisRutinasCasoDeUso(r), inject: [RutinaRepositorio] },
    { provide: VerRutinaCasoDeUso, useFactory: (r: RutinaRepositorio) => new VerRutinaCasoDeUso(r), inject: [RutinaRepositorio] },
    { provide: EliminarRutinaCasoDeUso, useFactory: (r: RutinaRepositorio) => new EliminarRutinaCasoDeUso(r), inject: [RutinaRepositorio] },
    { provide: UsarRutinaPredefinidaCasoDeUso, useFactory: (r: RutinaRepositorio) => new UsarRutinaPredefinidaCasoDeUso(r), inject: [RutinaRepositorio] },
    { provide: CrearRutinaCasoDeUso, useFactory: (r: RutinaRepositorio, c: CatalogoDeEjercicios) => new CrearRutinaCasoDeUso(r, c), inject: [RutinaRepositorio, CatalogoDeEjercicios] },
    { provide: ModificarRutinaCasoDeUso, useFactory: (r: RutinaRepositorio, c: CatalogoDeEjercicios) => new ModificarRutinaCasoDeUso(r, c), inject: [RutinaRepositorio, CatalogoDeEjercicios] },
  ],
})
export class EntrenamientoModule {}