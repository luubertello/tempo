
export abstract class ErrorDeDominio extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = new.target.name;
  }
}

export abstract class ErrorNoAutenticado extends ErrorDeDominio {} // 401
export abstract class ErrorProhibido extends ErrorDeDominio {} // 403
export abstract class ErrorNoEncontrado extends ErrorDeDominio {} // 404
export abstract class ErrorDeConflicto extends ErrorDeDominio {} // 409
export abstract class ErrorDeReglaViolada extends ErrorDeDominio {} // 422