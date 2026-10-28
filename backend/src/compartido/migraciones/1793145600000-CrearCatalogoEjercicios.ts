import { MigrationInterface, QueryRunner } from 'typeorm';

export class CrearCatalogoEjercicios1793145600000 implements MigrationInterface {
  name = 'CrearCatalogoEjercicios1793145600000';

  async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE ejercicios (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        nombre varchar(100) NOT NULL UNIQUE,
        tipo_medicion varchar(30) NOT NULL
          CHECK (tipo_medicion IN ('REPETICIONES_CON_CARGA','REPETICIONES_PESO_CORPORAL','TIEMPO'))
      )
    `);
    await q.query(`
      INSERT INTO ejercicios (nombre, tipo_medicion) VALUES
    ('Press banca', 'REPETICIONES_CON_CARGA'),
    ('Aperturas', 'REPETICIONES_CON_CARGA'),
    ('Cruce de poleas', 'REPETICIONES_CON_CARGA'),
    ('Peso muerto', 'REPETICIONES_CON_CARGA'),
    ('Remo con barra', 'REPETICIONES_CON_CARGA'),
    ('Jalón al pecho', 'REPETICIONES_CON_CARGA'),
    ('Press militar', 'REPETICIONES_CON_CARGA'),
    ('Elevaciones laterales', 'REPETICIONES_CON_CARGA'),
    ('Curl de bíceps', 'REPETICIONES_CON_CARGA'),
    ('Extensiones de tríceps', 'REPETICIONES_CON_CARGA'),
    ('Press francés', 'REPETICIONES_CON_CARGA'),
    ('Sentadilla', 'REPETICIONES_CON_CARGA'),
    ('Prensa de piernas', 'REPETICIONES_CON_CARGA'),
    ('Extensiones de cuádriceps', 'REPETICIONES_CON_CARGA'),
    ('Curl femoral', 'REPETICIONES_CON_CARGA'),
    ('Hip thrust', 'REPETICIONES_CON_CARGA'),
    ('Estocadas', 'REPETICIONES_CON_CARGA'),
    ('Dominadas', 'REPETICIONES_PESO_CORPORAL'),
    ('Flexiones de brazos', 'REPETICIONES_PESO_CORPORAL'),
    ('Sentadillas', 'REPETICIONES_PESO_CORPORAL'),
    ('Abdominales', 'REPETICIONES_PESO_CORPORAL'),
    ('Elevaciones de piernas', 'REPETICIONES_PESO_CORPORAL'),
    ('Plancha', 'TIEMPO'),
    ('Saltar la soga', 'TIEMPO')
    `);
  }

  async down(q: QueryRunner): Promise<void> {
    await q.query('DROP TABLE ejercicios');
  }
}