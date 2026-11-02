import { Injectable } from '@nestjs/common';
import { EjercicioRepositorio } from '../../catalogo/domain/ejercicio.repositorio';
import { TipoMedicion } from '../../catalogo/domain/tipo-medicion';
import { CatalogoDeEjercicios } from '../domain/catalogo-de-ejercicios';

@Injectable()
export class CatalogoAdaptador extends CatalogoDeEjercicios {
  constructor(private readonly ejercicios: EjercicioRepositorio) {
    super();
  }

  async tiposDeMedicion(ids: string[]): Promise<Map<string, TipoMedicion>> {
    const encontrados = await this.ejercicios.buscarPorIds([...new Set(ids)]);
    return new Map(encontrados.map((e) => [e.id, e.tipoMedicion]));
  }
}