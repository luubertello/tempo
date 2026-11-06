import { Injectable } from '@nestjs/common';
import { EjercicioRepositorio } from '../../catalogo/domain/ejercicio.repositorio';
import { CatalogoParaEstadisticas, DatosDeEjercicio } from '../domain/catalogo-para-estadisticas';

@Injectable()
export class CatalogoParaEstadisticasAdaptador extends CatalogoParaEstadisticas {
  constructor(private readonly ejercicios: EjercicioRepositorio) {
    super();
  }

  async datosDe(ids: string[]): Promise<Map<string, DatosDeEjercicio>> {
    const encontrados = await this.ejercicios.buscarPorIds([...new Set(ids)]);
    return new Map(encontrados.map((e) => [e.id, { nombre: e.nombre, tipoMedicion: e.tipoMedicion }]));
  }
}