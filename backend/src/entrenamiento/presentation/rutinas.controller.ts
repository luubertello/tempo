import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { UsuarioActual, UsuarioAutenticado } from '../../shared/presentation/usuario-actual.decorator';
import { CrearRutinaCasoDeUso } from '../application/crear-rutina.caso-de-uso';
import { ListarMisRutinasCasoDeUso, ListarRutinasPredefinidasCasoDeUso, VerRutinaCasoDeUso } from '../application/consultas-de-rutinas';
import { EliminarRutinaCasoDeUso } from '../application/eliminar-rutina.caso-de-uso';
import { ModificarRutinaCasoDeUso } from '../application/modificar-rutina.caso-de-uso';
import { UsarRutinaPredefinidaCasoDeUso } from '../application/usar-rutina-predefinida.caso-de-uso';
import { RutinaDto } from './rutina.dto';
import { aDatosDeEjercicios, aRespuesta } from './rutina.respuesta';

@Controller('rutinas')
export class RutinasController {
  constructor(
    private readonly predefinidas: ListarRutinasPredefinidasCasoDeUso,
    private readonly mias: ListarMisRutinasCasoDeUso,
    private readonly ver: VerRutinaCasoDeUso,
    private readonly crear: CrearRutinaCasoDeUso,
    private readonly modificar: ModificarRutinaCasoDeUso,
    private readonly eliminar: EliminarRutinaCasoDeUso,
    private readonly usar: UsarRutinaPredefinidaCasoDeUso,
  ) {}

  @Get('predefinidas')
  async listarPredefinidas() {
    return (await this.predefinidas.ejecutar()).map(aRespuesta);
  }

  @Get()
  async listarMias(@UsuarioActual() u: UsuarioAutenticado) {
    return (await this.mias.ejecutar({ usuarioId: u.usuarioId })).map(aRespuesta);
  }

  @Get(':id')
  async verUna(@UsuarioActual() u: UsuarioAutenticado, @Param('id', ParseUUIDPipe) id: string) {
    return aRespuesta(await this.ver.ejecutar({ usuarioId: u.usuarioId, rutinaId: id }));
  }

  @Post()
  async crearUna(@UsuarioActual() u: UsuarioAutenticado, @Body() dto: RutinaDto) {
    const r = await this.crear.ejecutar({ usuarioId: u.usuarioId, nombre: dto.nombre, ejercicios: aDatosDeEjercicios(dto) });
    return aRespuesta(r);
  }

  @Put(':id')
  async modificarUna(
    @UsuarioActual() u: UsuarioAutenticado,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RutinaDto,
  ) {
    const r = await this.modificar.ejecutar({
      usuarioId: u.usuarioId,
      rutinaId: id,
      nombre: dto.nombre,
      ejercicios: aDatosDeEjercicios(dto),
    });
    return aRespuesta(r);
  }

  @Delete(':id')
  @HttpCode(204)
  async eliminarUna(@UsuarioActual() u: UsuarioAutenticado, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.eliminar.ejecutar({ usuarioId: u.usuarioId, rutinaId: id });
  }

  @Post(':id/usar') 
  async usarUna(@UsuarioActual() u: UsuarioAutenticado, @Param('id', ParseUUIDPipe) id: string) {
    return aRespuesta(await this.usar.ejecutar({ usuarioId: u.usuarioId, rutinaId: id }));
  }
}