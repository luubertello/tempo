import {
  ErrorDeReglaViolada,
  ErrorNoEncontrado,
  ErrorProhibido,
} from '../../shared/domain/errores';

export class RutinaNoEncontrada extends ErrorNoEncontrado {
  constructor() {
    super('La rutina no existe.');
  }
}

export class RutinaPredefinidaNoModificable extends ErrorProhibido {
  constructor() {
    super('Las rutinas predefinidas no se pueden modificar ni eliminar. Usala para crear una copia propia.');
  }
}

export class EjercicioInexistente extends ErrorNoEncontrado {
  constructor(id: string) {
    super(`El ejercicio ${id} no existe en el catálogo.`);
  }
}

export class NombreDeRutinaInvalido extends ErrorDeReglaViolada {
  constructor(max: number) {
    super(`El nombre de la rutina es obligatorio y no puede superar ${max} caracteres.`);
  }
}

export class RutinaSinEjercicios extends ErrorDeReglaViolada {
  constructor() {
    super('La rutina no tiene ejercicios.');
  }
}

export class EjercicioSinSeries extends ErrorDeReglaViolada {
  constructor() {
    super('Cada ejercicio de la rutina necesita al menos una serie.');
  }
}

export class LimiteExcedido extends ErrorDeReglaViolada {}

export class SerieIncoherente extends ErrorDeReglaViolada {}