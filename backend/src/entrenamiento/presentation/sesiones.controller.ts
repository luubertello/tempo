import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UsuarioActual, UsuarioAutenticado } from '../../shared/presentation/usuario-actual.decorator';
import { VerSesionCasoDeUso, VerSesionEnCursoCasoDeUso } from '../application/consultas-de-sesiones';
import {
  CambiarFechaDeSesionCasoDeUso,
  CorregirSerieCasoDeUso,
  EliminarSesionCasoDeUso,
  ListarHistorialCasoDeUso,
  QuitarEjercicioCasoDeUso,
  QuitarSerieCasoDeUso,
  RegistrarSesionPasadaCasoDeUso,
} from '../application/historial-y-correcciones';
import { IniciarSesionCasoDeUso } from '../application/iniciar-sesion.caso-de-uso';
import {
  AbandonarSesionCasoDeUso,
  AgregarEjercicioASesionCasoDeUso,
  FinalizarSesionCasoDeUso,
  OmitirEjercicioCasoDeUso,
  RegistrarSerieCasoDeUso,
} from '../application/operaciones-de-sesion';
import { SerieDto } from './rutina.dto';
import {
  AgregarEjercicioDto,
  CambiarFechaDto,
  IniciarSesionDto,
  ListarSesionesDto,
  SerieRealDto,
  SesionPasadaDto,
} from './sesion.dto';
import { aRespuestaEjercicio, aRespuestaSerie, aRespuestaSesion, aResumenSesion } from './sesion.respuesta';

@Controller('sesiones')
export class SesionesController {
  constructor(
    private readonly iniciar: IniciarSesionCasoDeUso,
    private readonly enCurso: VerSesionEnCursoCasoDeUso,
    private readonly ver: VerSesionCasoDeUso,
    private readonly agregarEjercicio: AgregarEjercicioASesionCasoDeUso,
    private readonly registrarSerie: RegistrarSerieCasoDeUso,
    private readonly omitir: OmitirEjercicioCasoDeUso,
    private readonly finalizar: FinalizarSesionCasoDeUso,
    private readonly abandonar: AbandonarSesionCasoDeUso,
    private readonly pasada: RegistrarSesionPasadaCasoDeUso,
    private readonly corregirSerie: CorregirSerieCasoDeUso,
    private readonly quitarSerie: QuitarSerieCasoDeUso,
    private readonly quitarEjercicio: QuitarEjercicioCasoDeUso,
    private readonly cambiarFecha: CambiarFechaDeSesionCasoDeUso,
    private readonly eliminar: EliminarSesionCasoDeUso,
    private readonly historial: ListarHistorialCasoDeUso,
  ) {}

  @Post() 
  async iniciarSesion(@UsuarioActual() u: UsuarioAutenticado, @Body() dto: IniciarSesionDto) {
    return aRespuestaSesion(await this.iniciar.ejecutar({ usuarioId: u.usuarioId, rutinaId: dto?.rutina_id }));
  }

  @Post('pasadas')
  async registrarPasada(@UsuarioActual() u: UsuarioAutenticado, @Body() dto: SesionPasadaDto) {
    const s = await this.pasada.ejecutar({
      usuarioId: u.usuarioId,
      fechaSesion: dto.fecha_sesion,
      rutinaId: dto.rutina_id,
      ejercicios: dto.ejercicios.map((e) => ({
        ejercicioId: e.ejercicio_id,
        omitido: e.omitido ?? false,
        series: e.series.map((x) => ({
          completada: x.completada ?? true,
          repeticiones: x.repeticiones,
          carga: x.carga,
          duracionSegundos: x.duracion_segundos,
        })),
      })),
    });
    return aRespuestaSesion(s);
  }

  @Get('en-curso')
  async verEnCurso(@UsuarioActual() u: UsuarioAutenticado) {
    return aRespuestaSesion(await this.enCurso.ejecutar({ usuarioId: u.usuarioId }));
  }

  @Get()
  async listar(@UsuarioActual() u: UsuarioAutenticado, @Query() q: ListarSesionesDto) {
    const sesiones = await this.historial.ejecutar({
      usuarioId: u.usuarioId,
      filtro: { estado: q.estado, desde: q.desde, hasta: q.hasta },
    });
    return sesiones.map(aResumenSesion);
  }

  @Get(':id')
  async verUna(@UsuarioActual() u: UsuarioAutenticado, @Param('id', ParseUUIDPipe) id: string) {
    return aRespuestaSesion(await this.ver.ejecutar({ usuarioId: u.usuarioId, sesionId: id }));
  }

  @Patch(':id')
  async corregirFecha(
    @UsuarioActual() u: UsuarioAutenticado,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CambiarFechaDto,
  ) {
    return aRespuestaSesion(
      await this.cambiarFecha.ejecutar({ usuarioId: u.usuarioId, sesionId: id, fechaSesion: dto.fecha_sesion }),
    );
  }

  @Delete(':id')
  @HttpCode(204)
  async eliminarSesion(@UsuarioActual() u: UsuarioAutenticado, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.eliminar.ejecutar({ usuarioId: u.usuarioId, sesionId: id });
  }

  @Post(':id/ejercicios') // 201
  async agregar(
    @UsuarioActual() u: UsuarioAutenticado,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AgregarEjercicioDto,
  ) {
    const s = await this.agregarEjercicio.ejecutar({ usuarioId: u.usuarioId, sesionId: id, ejercicioId: dto.ejercicio_id });
    return aRespuestaSesion(s);
  }

  @Delete(':id/ejercicios/:orden')
  @HttpCode(204)
  async quitarUnEjercicio(
    @UsuarioActual() u: UsuarioAutenticado,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('orden', ParseIntPipe) orden: number,
  ): Promise<void> {
    await this.quitarEjercicio.ejecutar({ usuarioId: u.usuarioId, sesionId: id, ordenEjercicio: orden });
  }

  @Post(':id/ejercicios/:orden/series') // 201
  async registrar(
    @UsuarioActual() u: UsuarioAutenticado,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('orden', ParseIntPipe) orden: number,
    @Body() dto: SerieDto,
  ) {
    const serie = await this.registrarSerie.ejecutar({
      usuarioId: u.usuarioId,
      sesionId: id,
      orden,
      serie: { repeticiones: dto.repeticiones, carga: dto.carga, duracionSegundos: dto.duracion_segundos },
    });
    return aRespuestaSerie(serie);
  }

  @Patch(':id/ejercicios/:orden/series/:serie')
  async corregirUnaSerie(
    @UsuarioActual() u: UsuarioAutenticado,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('orden', ParseIntPipe) orden: number,
    @Param('serie', ParseIntPipe) serie: number,
    @Body() dto: SerieRealDto,
  ) {
    const s = await this.corregirSerie.ejecutar({
      usuarioId: u.usuarioId,
      sesionId: id,
      ordenEjercicio: orden,
      ordenSerie: serie,
      completada: dto.completada ?? true,
      serie: { repeticiones: dto.repeticiones, carga: dto.carga, duracionSegundos: dto.duracion_segundos },
    });
    return aRespuestaSerie(s);
  }

  @Delete(':id/ejercicios/:orden/series/:serie')
  @HttpCode(204)
  async quitarUnaSerie(
    @UsuarioActual() u: UsuarioAutenticado,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('orden', ParseIntPipe) orden: number,
    @Param('serie', ParseIntPipe) serie: number,
  ): Promise<void> {
    await this.quitarSerie.ejecutar({ usuarioId: u.usuarioId, sesionId: id, ordenEjercicio: orden, ordenSerie: serie });
  }

  @Post(':id/ejercicios/:orden/omitir')
  @HttpCode(200)
  async omitirEjercicio(
    @UsuarioActual() u: UsuarioAutenticado,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('orden', ParseIntPipe) orden: number,
  ) {
    return aRespuestaEjercicio(await this.omitir.ejecutar({ usuarioId: u.usuarioId, sesionId: id, orden }));
  }

  @Post(':id/finalizar')
  @HttpCode(200)
  async finalizarSesion(@UsuarioActual() u: UsuarioAutenticado, @Param('id', ParseUUIDPipe) id: string) {
    return aRespuestaSesion(await this.finalizar.ejecutar({ usuarioId: u.usuarioId, sesionId: id }));
  }

  @Post(':id/abandonar')
  @HttpCode(200)
  async abandonarSesion(@UsuarioActual() u: UsuarioAutenticado, @Param('id', ParseUUIDPipe) id: string) {
    return aRespuestaSesion(await this.abandonar.ejecutar({ usuarioId: u.usuarioId, sesionId: id }));
  }
}