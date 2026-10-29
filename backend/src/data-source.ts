import * as dotenv from 'dotenv';
dotenv.config();
import { DataSource } from 'typeorm';
import { ENTIDADES } from './entidades';
import { join } from 'path';
import { CrearCatalogoEjercicios1793145600000 } from './shared/migrations/1793145600000-CrearCatalogoEjercicios';
import { CrearUsuarios1793232000000 } from './shared/migrations/1793232000000-CrearUsuarios';


export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ENTIDADES,
  migrations: [join(__dirname, 'shared', 'migrations', '*.{ts,js}')],
});