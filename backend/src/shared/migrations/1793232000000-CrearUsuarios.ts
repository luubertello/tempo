import { MigrationInterface, QueryRunner } from 'typeorm';

export class CrearUsuarios1793232000000 implements MigrationInterface {
  name = 'CrearUsuarios1793232000000';

  async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE usuarios (
        id uuid PRIMARY KEY,
        email varchar(254) NOT NULL UNIQUE,
        hash_contrasena varchar(100) NOT NULL,
        rol varchar(20) NOT NULL CHECK (rol IN ('USUARIO','ADMIN'))
      )
    `);
  }

  async down(q: QueryRunner): Promise<void> {
    await q.query('DROP TABLE usuarios');
  }
}