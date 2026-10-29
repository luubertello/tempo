import { EmailInvalido } from './errores';

// Value object: siempre normalizado (minusculas, sin espacios) y con formato valido
export class Email {
  private constructor(readonly valor: string) {}

  static crear(crudo: string): Email {
    const valor = crudo.trim().toLowerCase();
    if (valor.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
      throw new EmailInvalido();
    }
    return new Email(valor);
  }
}