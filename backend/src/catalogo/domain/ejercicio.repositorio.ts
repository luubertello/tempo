import { Ejercicio } from "./ejercicio";

// Puerto: el dominio define qué necesita; la infraestructura lo implementa.
// Es clase abstracta para poder usarla como token de inyección sin tocar el dominio con decoradores.
export abstract class EjercicioRepositorio {
  abstract listar(): Promise<Ejercicio[]>;
  abstract buscarPorId(id: string): Promise<Ejercicio | null>;
}