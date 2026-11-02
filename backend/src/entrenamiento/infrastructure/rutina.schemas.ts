import { EntitySchema } from 'typeorm';

export interface RutinaFila {
  id: string;
  usuarioId: string | null;
  nombre: string;
  origen: string;
}
export interface RutinaEjercicioFila {
  rutinaId: string;
  orden: number;
  ejercicioId: string;
}
export interface RutinaSerieFila {
  rutinaId: string;
  ordenEjercicio: number;
  orden: number;
  repeticiones: number | null;
  carga: number | null;
  duracionSegundos: number | null;
}

const numerico = {
  to: (v: number | null) => v,
  from: (v: string | null) => (v === null ? null : Number(v)),
};

export const RutinaSchema = new EntitySchema<RutinaFila>({
  name: 'Rutina',
  tableName: 'rutinas',
  columns: {
    id: { type: 'uuid', primary: true },
    usuarioId: { name: 'usuario_id', type: 'uuid', nullable: true },
    nombre: { type: 'varchar', length: 100 },
    origen: { type: 'varchar', length: 12 },
  },
});

export const RutinaEjercicioSchema = new EntitySchema<RutinaEjercicioFila>({
  name: 'RutinaEjercicio',
  tableName: 'rutina_ejercicios',
  columns: {
    rutinaId: { name: 'rutina_id', type: 'uuid', primary: true },
    orden: { type: 'int', primary: true },
    ejercicioId: { name: 'ejercicio_id', type: 'uuid' },
  },
});

export const RutinaSerieSchema = new EntitySchema<RutinaSerieFila>({
  name: 'RutinaSerie',
  tableName: 'rutina_series',
  columns: {
    rutinaId: { name: 'rutina_id', type: 'uuid', primary: true },
    ordenEjercicio: { name: 'orden_ejercicio', type: 'int', primary: true },
    orden: { type: 'int', primary: true },
    repeticiones: { type: 'int', nullable: true },
    carga: { type: 'numeric', precision: 7, scale: 2, nullable: true, transformer: numerico },
    duracionSegundos: { name: 'duracion_segundos', type: 'int', nullable: true },
  },
});