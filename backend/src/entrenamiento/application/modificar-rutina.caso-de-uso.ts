import { CatalogoDeEjercicios } from '../domain/catalogo-de-ejercicios';
import { RutinaNoEncontrada } from '../domain/errores';
import { DatosEjercicio, Rutina } from '../domain/rutina';
import { RutinaRepositorio } from '../domain/rutina.repositorio';

// CU8. Reemplaza todo el contenido. Reglas: R2 a R8, R10
export class ModificarRutinaCasoDeUso {
  constructor(
    private readonly rutinas: RutinaRepositorio,
    private readonly catalogo: CatalogoDeEjercicios,
  ) {}

  async ejecutar(e: { usuarioId: string; rutinaId: string; nombre: string; ejercicios: DatosEjercicio[] }): Promise<Rutina> {
    const actual = await this.rutinas.buscarPorId(e.rutinaId);
    if (!actual) throw new RutinaNoEncontrada();
    actual.asegurarEditablePor(e.usuarioId); 

    const tipos = await this.catalogo.tiposDeMedicion(e.ejercicios.map((x) => x.ejercicioId));
    const modificada = actual.modificar(e.usuarioId, e.nombre, e.ejercicios, tipos);
    await this.rutinas.guardar(modificada);
    return modificada;
  }
}