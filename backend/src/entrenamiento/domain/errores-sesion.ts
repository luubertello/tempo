import {
  ErrorDeConflicto,
  ErrorDeReglaViolada,
  ErrorNoEncontrado,
} from '../../shared/domain/errores';

export class SesionNoEncontrada extends ErrorNoEncontrado {
  constructor() {
    super('La sesión no existe.');
  }
}

export class NoHaySesionEnCurso extends ErrorNoEncontrado {
  constructor() {
    super('No tenés una sesión en curso.');
  }
}

export class EjercicioDeSesionNoEncontrado extends ErrorNoEncontrado {
  constructor() {
    super('El ejercicio no está en la sesión.');
  }
}

export class SesionEnCursoExistente extends ErrorDeConflicto {
  constructor() {
    super('Ya tenés una sesión en curso. Finalizala o abandonala antes de iniciar otra.');
  }
}

export class SesionNoEnCurso extends ErrorDeConflicto {
  constructor() {
    super('La sesión no está en curso.');
  }
}

export class RutinaNoIniciable extends ErrorDeReglaViolada {
  constructor() {
    super('Las rutinas predefinidas no se inician directo. Usala primero para crear una copia propia.');
  }
}

export class SesionSinSeriesCompletadas extends ErrorDeReglaViolada {
  constructor() {
    super('Para finalizar la sesión tiene que haber al menos una serie completada.');
  }
}

export class EjercicioSinSeriesEnSesion extends ErrorDeReglaViolada {
  constructor(orden: number) {
    super(`El ejercicio ${orden} de la sesión no tiene series.`);
  }
}