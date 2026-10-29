import { TipoMedicion } from "./tipo-medicion";

// Ejercicio del catálogo: definido por la app, solo lectura.
export class Ejercicio {
  constructor(
    readonly id: string,
    readonly nombre: string,
    readonly tipoMedicion: TipoMedicion,
  ) {}
}