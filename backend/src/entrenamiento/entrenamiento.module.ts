import { Module, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogoModule } from '../catalogo/catalogo.module';
import { EjercicioRepositorio } from '../catalogo/domain/ejercicio.repositorio';
import { ListarMisRutinasCasoDeUso, ListarRutinasPredefinidasCasoDeUso, VerRutinaCasoDeUso } from './application/consultas-de-rutinas';
import { VerSesionCasoDeUso, VerSesionEnCursoCasoDeUso } from './application/consultas-de-sesiones';
import { CrearRutinaCasoDeUso } from './application/crear-rutina.caso-de-uso';
import { EliminarRutinaCasoDeUso } from './application/eliminar-rutina.caso-de-uso';
import { IniciarSesionCasoDeUso } from './application/iniciar-sesion.caso-de-uso';
import { ModificarRutinaCasoDeUso } from './application/modificar-rutina.caso-de-uso';
import {
  AbandonarSesionCasoDeUso,
  AgregarEjercicioASesionCasoDeUso,
  FinalizarSesionCasoDeUso,
  OmitirEjercicioCasoDeUso,
  RegistrarSerieCasoDeUso,
} from './application/operaciones-de-sesion';
import { UsarRutinaPredefinidaCasoDeUso } from './application/usar-rutina-predefinida.caso-de-uso';
import { CatalogoDeEjercicios } from './domain/catalogo-de-ejercicios';
import { Reloj } from './domain/reloj';
import { RutinaRepositorio } from './domain/rutina.repositorio';
import { SesionRepositorio } from './domain/sesion.repositorio';
import { CatalogoAdaptador } from './infrastructure/catalogo.adaptador';
import { RelojSistema } from './infrastructure/reloj.sistema';
import { RutinaRepositorioTypeOrm } from './infrastructure/rutina.repositorio.typeorm';
import { RutinaEjercicioSchema, RutinaSchema, RutinaSerieSchema } from './infrastructure/rutina.schemas';
import { SesionRepositorioTypeOrm } from './infrastructure/sesion.repositorio.typeorm';
import { SesionEjercicioSchema, SesionSchema, SesionSerieSchema } from './infrastructure/sesion.schemas';
import { RutinasController } from './presentation/rutinas.controller';
import { SesionesController } from './presentation/sesiones.controller';
import {
  CambiarFechaDeSesionCasoDeUso,
  CorregirSerieCasoDeUso,
  EliminarSesionCasoDeUso,
  ListarHistorialCasoDeUso,
  QuitarEjercicioCasoDeUso,
  QuitarSerieCasoDeUso,
  RegistrarSesionPasadaCasoDeUso,
} from './application/historial-y-correcciones';
import { PublicadorDeSesionesFinalizadas } from './application/publicar-sesiones-finalizadas';
import { SesionesFinalizadas } from './published/sesiones-finalizadas';

const caso = <T>(clase: new (...args: any[]) => T, ...dependencias: unknown[]): Provider => ({
  provide: clase,
  useFactory: (...deps: any[]) => new clase(...deps),
  inject: dependencias as any[],
});

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RutinaSchema, RutinaEjercicioSchema, RutinaSerieSchema,
      SesionSchema, SesionEjercicioSchema, SesionSerieSchema,
    ]),
    CatalogoModule,
  ],
  controllers: [RutinasController, SesionesController],
  providers: [
    { provide: RutinaRepositorio, useClass: RutinaRepositorioTypeOrm },
    { provide: SesionRepositorio, useClass: SesionRepositorioTypeOrm },
    {
      provide: CatalogoDeEjercicios,
      useFactory: (e: EjercicioRepositorio) => new CatalogoAdaptador(e),
      inject: [EjercicioRepositorio],
    },
    {
      provide: Reloj,
      useFactory: (c: ConfigService) =>
        new RelojSistema(c.get<string>('ZONA_HORARIA') ?? 'America/Argentina/Buenos_Aires'),
      inject: [ConfigService],
    },
        {
      provide: SesionesFinalizadas,
      useFactory: (s: SesionRepositorio) => new PublicadorDeSesionesFinalizadas(s),
      inject: [SesionRepositorio],
    },

    // Rutinas
    caso(ListarRutinasPredefinidasCasoDeUso, RutinaRepositorio),
    caso(ListarMisRutinasCasoDeUso, RutinaRepositorio),
    caso(VerRutinaCasoDeUso, RutinaRepositorio),
    caso(EliminarRutinaCasoDeUso, RutinaRepositorio),
    caso(UsarRutinaPredefinidaCasoDeUso, RutinaRepositorio),
    caso(CrearRutinaCasoDeUso, RutinaRepositorio, CatalogoDeEjercicios),
    caso(ModificarRutinaCasoDeUso, RutinaRepositorio, CatalogoDeEjercicios),

    // Sesiones
    caso(IniciarSesionCasoDeUso, SesionRepositorio, RutinaRepositorio, Reloj),
    caso(AgregarEjercicioASesionCasoDeUso, SesionRepositorio, CatalogoDeEjercicios),
    caso(RegistrarSerieCasoDeUso, SesionRepositorio, CatalogoDeEjercicios),
    caso(OmitirEjercicioCasoDeUso, SesionRepositorio),
    caso(FinalizarSesionCasoDeUso, SesionRepositorio),
    caso(AbandonarSesionCasoDeUso, SesionRepositorio),
    caso(VerSesionCasoDeUso, SesionRepositorio),
    caso(VerSesionEnCursoCasoDeUso, SesionRepositorio),
    caso(RegistrarSesionPasadaCasoDeUso, SesionRepositorio, RutinaRepositorio, CatalogoDeEjercicios, Reloj),
    caso(CorregirSerieCasoDeUso, SesionRepositorio, CatalogoDeEjercicios),
    caso(QuitarSerieCasoDeUso, SesionRepositorio),
    caso(QuitarEjercicioCasoDeUso, SesionRepositorio),
    caso(CambiarFechaDeSesionCasoDeUso, SesionRepositorio, Reloj),
    caso(EliminarSesionCasoDeUso, SesionRepositorio),
    caso(ListarHistorialCasoDeUso, SesionRepositorio),
  ],
  exports: [SesionesFinalizadas],
})
export class EntrenamientoModule {}