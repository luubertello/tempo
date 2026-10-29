import { Rol } from './rol';

export abstract class HasheadorContrasena {
  abstract hashear(contrasena: string): Promise<string>;
  abstract comparar(contrasena: string, hash: string): Promise<boolean>;
}

export interface DatosDelToken {
  usuarioId: string;
  rol: Rol;
}

export abstract class EmisorDeTokens {
  abstract emitir(datos: DatosDelToken): Promise<string>;
}