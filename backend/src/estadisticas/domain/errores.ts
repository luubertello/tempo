import { ErrorDeReglaViolada, ErrorNoEncontrado } from '../../shared/domain/errores';

export class EjercicioNoEncontrado extends ErrorNoEncontrado {
  constructor() {
    super('El ejercicio no existe.');
  }
}

export class FechaDeFiltroInvalida extends ErrorDeReglaViolada {
  constructor() {
    super('La fecha del filtro no es válida. Usá el formato AAAA-MM-DD.');
  }
}

export class RangoDeFechasInvalido extends ErrorDeReglaViolada {
  constructor() {
    super("'desde' no puede ser posterior a 'hasta'.");
  }
}