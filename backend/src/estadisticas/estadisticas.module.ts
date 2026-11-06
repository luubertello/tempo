import { Module } from '@nestjs/common';
import { CatalogoModule } from '../catalogo/catalogo.module';
import { EjercicioRepositorio } from '../catalogo/domain/ejercicio.repositorio';
import { EntrenamientoModule } from '../entrenamiento/entrenamiento.module';
import { SesionesFinalizadas } from '../entrenamiento/published/sesiones-finalizadas';
import { EvolucionDeEjercicioCasoDeUso } from './application/evolucion-de-ejercicio.caso-de-uso';
import { ResumenPorEjercicioCasoDeUso } from './application/resumen-por-ejercicio.caso-de-uso';
import { CatalogoParaEstadisticas } from './domain/catalogo-para-estadisticas';
import { CatalogoParaEstadisticasAdaptador } from './infrastructure/catalogo-para-estadisticas.adaptador';
import { EstadisticasController } from './presentation/estadisticas.controller';

@Module({
  imports: [CatalogoModule, EntrenamientoModule],
  controllers: [EstadisticasController],
  providers: [
    {
      provide: CatalogoParaEstadisticas,
      useFactory: (e: EjercicioRepositorio) => new CatalogoParaEstadisticasAdaptador(e),
      inject: [EjercicioRepositorio],
    },
    {
      provide: ResumenPorEjercicioCasoDeUso,
      useFactory: (s: SesionesFinalizadas, c: CatalogoParaEstadisticas) => new ResumenPorEjercicioCasoDeUso(s, c),
      inject: [SesionesFinalizadas, CatalogoParaEstadisticas],
    },
    {
      provide: EvolucionDeEjercicioCasoDeUso,
      useFactory: (s: SesionesFinalizadas, c: CatalogoParaEstadisticas) => new EvolucionDeEjercicioCasoDeUso(s, c),
      inject: [SesionesFinalizadas, CatalogoParaEstadisticas],
    },
  ],
})
export class EstadisticasModule {}