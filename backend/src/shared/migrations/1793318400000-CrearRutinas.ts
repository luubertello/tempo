import { MigrationInterface, QueryRunner } from 'typeorm';


const PREDEFINIDAS = [
  {
    nombre: 'Cuerpo completo (principiantes)',
    ejercicios: [
      { nombre: 'Sentadilla', series: [{ r: 10 }, { r: 10 }, { r: 10 }] },
      { nombre: 'Press banca', series: [{ r: 10 }, { r: 10 }, { r: 10 }] },
      { nombre: 'Remo con barra', series: [{ r: 10 }, { r: 10 }, { r: 10 }] },
      { nombre: 'Plancha', series: [{ d: 30 }, { d: 30 }, { d: 30 }] },
    ],
  },
  {
    nombre: 'Piernas',
    ejercicios: [
      { nombre: 'Sentadilla', series: [{ r: 8 }, { r: 8 }, { r: 8 }, { r: 8 }] },
      { nombre: 'Prensa de piernas', series: [{ r: 12 }, { r: 12 }, { r: 12 }] },
      { nombre: 'Extensiones de cuádriceps', series: [{ r: 12 }, { r: 12 }, { r: 12 }] },
      { nombre: 'Curl femoral', series: [{ r: 12 }, { r: 12 }, { r: 12 }] },
      { nombre: 'Hip thrust', series: [{ r: 10 }, { r: 10 }, { r: 10 }] },
    ],
  },
  {
    nombre: 'Tren superior',
    ejercicios: [
      { nombre: 'Press banca', series: [{ r: 8 }, { r: 8 }, { r: 8 }, { r: 8 }] },
      { nombre: 'Jalón al pecho', series: [{ r: 10 }, { r: 10 }, { r: 10 }] },
      { nombre: 'Press militar', series: [{ r: 10 }, { r: 10 }, { r: 10 }] },
      { nombre: 'Curl de bíceps', series: [{ r: 12 }, { r: 12 }, { r: 12 }] },
      { nombre: 'Extensiones de tríceps', series: [{ r: 12 }, { r: 12 }, { r: 12 }] },
    ],
  },
];

export class CrearRutinas1793318400000 implements MigrationInterface {
  name = 'CrearRutinas1793318400000';

  async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE rutinas (
        id uuid PRIMARY KEY,
        usuario_id uuid NULL,
        nombre varchar(100) NOT NULL,
        origen varchar(12) NOT NULL CHECK (origen IN ('PROPIA','PREDEFINIDA')),
        -- R1: la propia tiene dueño, la predefinida no
        CONSTRAINT rutina_dueno CHECK (
          (origen = 'PROPIA' AND usuario_id IS NOT NULL) OR (origen = 'PREDEFINIDA' AND usuario_id IS NULL)
        )
      )
    `);
    await q.query('CREATE INDEX idx_rutinas_usuario ON rutinas (usuario_id)');
    await q.query(`
      CREATE TABLE rutina_ejercicios (
        rutina_id uuid NOT NULL REFERENCES rutinas(id) ON DELETE CASCADE,
        orden int NOT NULL CHECK (orden >= 1),
        ejercicio_id uuid NOT NULL,
        PRIMARY KEY (rutina_id, orden)
      )
    `);
    await q.query(`
      CREATE TABLE rutina_series (
        rutina_id uuid NOT NULL,
        orden_ejercicio int NOT NULL,
        orden int NOT NULL CHECK (orden >= 1),
        repeticiones int NULL CHECK (repeticiones > 0),
        carga numeric(7,2) NULL CHECK (carga > 0),
        duracion_segundos int NULL CHECK (duracion_segundos > 0),
        PRIMARY KEY (rutina_id, orden_ejercicio, orden),
        FOREIGN KEY (rutina_id, orden_ejercicio)
          REFERENCES rutina_ejercicios (rutina_id, orden) ON DELETE CASCADE
      )
    `);

    for (const rutina of PREDEFINIDAS) {
      const resueltos: { id: string; series: { r?: number; d?: number }[] }[] = [];
      for (const e of rutina.ejercicios) {
        const filas = await q.query('SELECT id FROM ejercicios WHERE nombre = $1', [e.nombre]);
        if (filas.length > 0) resueltos.push({ id: filas[0].id, series: e.series });
      }
      if (resueltos.length === 0) continue; 

      const [{ id: rutinaId }] = await q.query(
        `INSERT INTO rutinas (id, usuario_id, nombre, origen) VALUES (gen_random_uuid(), NULL, $1, 'PREDEFINIDA') RETURNING id`,
        [rutina.nombre],
      );
      for (const [i, e] of resueltos.entries()) {
        await q.query('INSERT INTO rutina_ejercicios (rutina_id, orden, ejercicio_id) VALUES ($1, $2, $3)', [rutinaId, i + 1, e.id]);
        for (const [j, s] of e.series.entries()) {
          await q.query(
            'INSERT INTO rutina_series (rutina_id, orden_ejercicio, orden, repeticiones, duracion_segundos) VALUES ($1, $2, $3, $4, $5)',
            [rutinaId, i + 1, j + 1, s.r ?? null, s.d ?? null],
          );
        }
      }
    }
  }

  async down(q: QueryRunner): Promise<void> {
    await q.query('DROP TABLE rutina_series');
    await q.query('DROP TABLE rutina_ejercicios');
    await q.query('DROP TABLE rutinas');
  }
}