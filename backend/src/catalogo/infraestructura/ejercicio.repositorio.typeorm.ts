import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ejercicio } from '../dominio/ejercicio.js';
import { EjercicioRepositorio } from '../dominio/ejercicio.repositorio.js';
import { TipoMedicion } from '../dominio/tipo-medicion.js';
import { EjercicioFila, EjercicioSchema } from './ejercicio.schema.js';

@Injectable()
export class EjercicioRepositorioTypeOrm extends EjercicioRepositorio {
  constructor(
    @InjectRepository(EjercicioSchema)
    private readonly repo: Repository<EjercicioFila>,
  ) {
    super();
  }

  async listar(): Promise<Ejercicio[]> {
    const filas = await this.repo.find({ order: { nombre: 'ASC' } });
    return filas.map(this.aDominio);
  }

  async buscarPorId(id: string): Promise<Ejercicio | null> {
    const fila = await this.repo.findOneBy({ id });
    return fila ? this.aDominio(fila) : null;
  }

  // Mapper fila -> dominio
  private aDominio(f: EjercicioFila): Ejercicio {
    return new Ejercicio(f.id, f.nombre, f.tipoMedicion as TipoMedicion);
  }
}