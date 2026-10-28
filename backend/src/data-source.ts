import 'dotenv/config';
import { DataSource } from 'typeorm';
import { join } from 'path';
import { EjercicioSchema } from './catalogo/infrastructure/ejercicio.schema.js';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [EjercicioSchema],
  migrations: [join(__dirname, 'compartido', 'migraciones', '*{.ts,.js}')],
});