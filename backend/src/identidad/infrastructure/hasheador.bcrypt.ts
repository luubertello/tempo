import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { HasheadorContrasena } from '../domain/puertos';

const COSTO = 10;

@Injectable()
export class HasheadorBcrypt extends HasheadorContrasena {
  hashear(contrasena: string): Promise<string> {
    return bcrypt.hash(contrasena, COSTO);
  }
  comparar(contrasena: string, hash: string): Promise<boolean> {
    return bcrypt.compare(contrasena, hash);
  }
}