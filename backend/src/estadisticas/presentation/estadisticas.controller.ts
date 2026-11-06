import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { UsuarioActual, UsuarioAutenticado } from '../../shared/presentation/usuario-actual.decorator';
import { EvolucionDeEjercicioCasoDeUso } from '../application/evolucion-de-ejercicio.caso-de-uso';
import { ResumenPorEjercicioCasoDeUso } from '../application/resumen-por-ejercicio.caso-de-uso';
import { RangoDto } from './estadisticas.dto';
import { aRespuestaEvolucion, aRespuestaResumen } from './estadisticas.respuesta';

@Controller('estadisticas')
export class EstadisticasController {
  constructor(
    private readonly resumen: ResumenPorEjercicioCasoDeUso,
    private readonly evolucion: EvolucionDeEjercicioCasoDeUso,
  ) {}

  @Get('ejercicios')
  async resumenPorEjercicio(@UsuarioActual() u: UsuarioAutenticado) {
    return (await this.resumen.ejecutar({ usuarioId: u.usuarioId })).map(aRespuestaResumen);
  }

  @Get('ejercicios/:ejercicio_id/evolucion')
  async evolucionDeUnEjercicio(
    @UsuarioActual() u: UsuarioAutenticado,
    @Param('ejercicio_id', ParseUUIDPipe) ejercicioId: string,
    @Query() q: RangoDto,
  ) {
    return aRespuestaEvolucion(
      await this.evolucion.ejecutar({ usuarioId: u.usuarioId, ejercicioId, desde: q.desde, hasta: q.hasta }),
    );
  }
}