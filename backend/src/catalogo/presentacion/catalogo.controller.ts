import { Controller, Get } from '@nestjs/common';
import { ListarEjerciciosCasoDeUso } from '../aplicacion/listar-ejercicios.caso-de-uso.js';
import { aRespuesta, EjercicioRespuesta } from './ejercicio.respuesta.js';

@Controller('ejercicios')
export class CatalogoController {
  constructor(private readonly listarEjercicios: ListarEjerciciosCasoDeUso) {}

  @Get()
  async listar(): Promise<EjercicioRespuesta[]> {
    const ejercicios = await this.listarEjercicios.ejecutar();
    return ejercicios.map(aRespuesta);
  }
}