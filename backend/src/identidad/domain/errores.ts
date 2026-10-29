import { ErrorDeConflicto, ErrorDeReglaViolada, ErrorNoAutenticado } from '../../shared/domain/errores';

export class EmailYaRegistrado extends ErrorDeConflicto {
  constructor() {
    super('El email ya está registrado.');
  }
}

export class EmailInvalido extends ErrorDeReglaViolada {
  constructor() {
    super('El email no es válido.');
  }
}

export class CredencialesInvalidas extends ErrorNoAutenticado {
  constructor() {
    super('Email o contraseña incorrectos.');
  }
}