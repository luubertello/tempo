import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, ParseUUIDPipe, Post } from '@nestjs/common';
import { UsuarioActual, UsuarioAutenticado } from '../../shared/presentation/usuario-actual.decorator';
import { VerSesionCasoDeUso, VerSesionEnCursoCasoDeUso } from '../application/consultas-de-sesiones';
import { IniciarSesionCasoDeUso } from '../application/iniciar-sesion.caso-de-uso';
import {
  AbandonarSesionCasoDeUso,
  AgregarEjercicioASesionCasoDeUso,
  FinalizarSesionCasoDeUso,
  OmitirEjercicioCasoDeUso,
  RegistrarSerieCasoDeUso,
} from '../application/operaciones-de-sesion';
import { SerieDto } from './rutina.dto';
import { AgregarEjercicioDto, IniciarSesionDto } from './sesion.dto';
import { aRespuestaEjercicio, aRespuestaSerie, aRespuestaSesion } from './sesion.respuesta';

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
  ) {}

  @Post() 
  async iniciarSesion(@UsuarioActual() u: UsuarioAutenticado, @Body() dto: IniciarSesionDto) {
    return aRespuestaSesion(await this.iniciar.ejecutar({ usuarioId: u.usuarioId, rutinaId: dto?.rutina_id }));
  }

  @Get('en-curso')
  async verEnCurso(@UsuarioActual() u: UsuarioAutenticado) {
    return aRespuestaSesion(await this.enCurso.ejecutar({ usuarioId: u.usuarioId }));
  }

  @Get(':id')
  async verUna(@UsuarioActual() u: UsuarioAutenticado, @Param('id', ParseUUIDPipe) id: string) {
    return aRespuestaSesion(await this.ver.ejecutar({ usuarioId: u.usuarioId, sesionId: id }));
  }

  @Post(':id/ejercicios') 
  async agregar(
    @UsuarioActual() u: UsuarioAutenticado,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AgregarEjercicioDto,
  ) {
    const s = await this.agregarEjercicio.ejecutar({ usuarioId: u.usuarioId, sesionId: id, ejercicioId: dto.ejercicio_id });
    return aRespuestaSesion(s);
  }

  @Post(':id/ejercicios/:orden/series') 
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