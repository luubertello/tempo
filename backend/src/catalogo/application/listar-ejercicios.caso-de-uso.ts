import { Ejercicio } from "../domain/ejercicio.js";
import { EjercicioRepositorio } from '../domain/ejercicio.repositorio.js';

// CU3. Sin decoradores de Nest: la capa de aplicación depende solo del dominio.
export class ListarEjerciciosCasoDeUso {
  constructor(private readonly ejercicios: EjercicioRepositorio) {}

  ejecutar(): Promise<Ejercicio[]> {
    return this.ejercicios.listar();
  }
}