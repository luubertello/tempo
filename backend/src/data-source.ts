
import { DataSource } from 'typeorm';
import { ENTIDADES } from './entidades';
import { join } from 'path';



export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true'
    ? { rejectUnauthorized: false }
    : false,
  entities: ENTIDADES,
  migrations: [join(__dirname, 'shared', 'migrations', '*.{ts,js}')],
});