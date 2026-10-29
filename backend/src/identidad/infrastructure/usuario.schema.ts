import { EntitySchema } from 'typeorm';

export interface UsuarioFila {
  id: string;
  email: string;
  hashContrasena: string;
  rol: string;
}

export const UsuarioSchema = new EntitySchema<UsuarioFila>({
  name: 'Usuario',
  tableName: 'usuarios',
  columns: {
    id: { type: 'uuid', primary: true },
    email: { type: 'varchar', length: 254, unique: true },
    hashContrasena: { name: 'hash_contrasena', type: 'varchar', length: 100 },
    rol: { type: 'varchar', length: 20 },
  },
});