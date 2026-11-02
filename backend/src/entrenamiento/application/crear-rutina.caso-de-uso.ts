import { randomUUID } from 'node:crypto';
import { CatalogoDeEjercicios } from '../domain/catalogo-de-ejercicios';
import { DatosEjercicio, Rutina } from '../domain/rutina';
import { RutinaRepositorio } from '../domain/rutina.repositorio';

// CU7, reglas: R1 a R7
export class CrearRutinaCasoDeUso {
  constructor(
    private readonly rutinas: RutinaRepositorio,
    private readonly catalogo: CatalogoDeEjercicios,
  ) {}

  async ejecutar(e: { usuarioId: string; nombre: string; ejercicios: DatosEjercicio[] }): Promise<Rutina> {
    const tipos = await this.catalogo.tiposDeMedicion(e.ejercicios.map((x) => x.ejercicioId));
    const rutina = Rutina.crearPropia(randomUUID(), e.usuarioId, e.nombre, e.ejercicios, tipos);
    await this.rutinas.guardar(rutina);
    return rutina;
  }
}