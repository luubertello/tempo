import { MigrationInterface, QueryRunner } from 'typeorm';

export class CrearSesiones1793404800000 implements MigrationInterface {
  name = 'CrearSesiones1793404800000';

  async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE sesiones (
        id uuid PRIMARY KEY,
        usuario_id uuid NOT NULL,
        rutina_id uuid NULL,            -- rastro, sin FK: la rutina puede borrarse (R10)
        nombre_rutina varchar(100) NULL,
        fecha_sesion date NOT NULL,
        fecha_registro timestamptz NOT NULL,
        estado varchar(12) NOT NULL CHECK (estado IN ('EN_CURSO','FINALIZADA','ABANDONADA'))
      )
    `);
    await q.query('CREATE INDEX idx_sesiones_usuario_fecha ON sesiones (usuario_id, fecha_sesion DESC)');
    await q.query(`
      CREATE UNIQUE INDEX ux_sesion_en_curso_por_usuario ON sesiones (usuario_id) WHERE estado = 'EN_CURSO'
    `);

    await q.query(`
      CREATE TABLE sesion_ejercicios (
        sesion_id uuid NOT NULL REFERENCES sesiones(id) ON DELETE CASCADE,
        orden int NOT NULL CHECK (orden >= 1),
        ejercicio_id uuid NOT NULL,
        omitido boolean NOT NULL DEFAULT false,
        PRIMARY KEY (sesion_id, orden)
      )
    `);
    await q.query(`
      CREATE TABLE sesion_series (
        sesion_id uuid NOT NULL,
        orden_ejercicio int NOT NULL,
        orden int NOT NULL CHECK (orden >= 1),
        completada boolean NOT NULL,
        repeticiones int NULL CHECK (repeticiones > 0),
        carga numeric(7,2) NULL CHECK (carga > 0),
        duracion_segundos int NULL CHECK (duracion_segundos > 0),
        objetivo_repeticiones int NULL CHECK (objetivo_repeticiones > 0),
        objetivo_carga numeric(7,2) NULL CHECK (objetivo_carga > 0),
        objetivo_duracion_segundos int NULL CHECK (objetivo_duracion_segundos > 0),
        PRIMARY KEY (sesion_id, orden_ejercicio, orden),
        FOREIGN KEY (sesion_id, orden_ejercicio)
          REFERENCES sesion_ejercicios (sesion_id, orden) ON DELETE CASCADE,
        -- R20: una serie no completada no tiene valores reales
        CONSTRAINT serie_sin_valores_si_no_completada CHECK (
          completada OR (repeticiones IS NULL AND carga IS NULL AND duracion_segundos IS NULL)
        )
      )
    `);
  }

  async down(q: QueryRunner): Promise<void> {
    await q.query('DROP TABLE sesion_series');
    await q.query('DROP TABLE sesion_ejercicios');
    await q.query('DROP TABLE sesiones');
  }
}