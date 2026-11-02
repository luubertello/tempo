import { EntitySchema } from 'typeorm';

export interface SesionFila {
  id: string;
  usuarioId: string;
  rutinaId: string | null;
  nombreRutina: string | null;
  fechaSesion: string;
  fechaRegistro: Date;
  estado: string;
}
export interface SesionEjercicioFila {
  sesionId: string;
  orden: number;
  ejercicioId: string;
  omitido: boolean;
}
export interface SesionSerieFila {
  sesionId: string;
  ordenEjercicio: number;
  orden: number;
  completada: boolean;
  repeticiones: number | null;
  carga: number | null;
  duracionSegundos: number | null;
  objetivoRepeticiones: number | null;
  objetivoCarga: number | null;
  objetivoDuracionSegundos: number | null;
}

const numerico = {
  to: (v: number | null) => v,
  from: (v: string | null) => (v === null ? null : Number(v)),
};

export const SesionSchema = new EntitySchema<SesionFila>({
  name: 'Sesion',
  tableName: 'sesiones',
  columns: {
    id: { type: 'uuid', primary: true },
    usuarioId: { name: 'usuario_id', type: 'uuid' },
    rutinaId: { name: 'rutina_id', type: 'uuid', nullable: true },
    nombreRutina: { name: 'nombre_rutina', type: 'varchar', length: 100, nullable: true },
    fechaSesion: { name: 'fecha_sesion', type: 'date' },
    fechaRegistro: { name: 'fecha_registro', type: 'timestamptz' },
    estado: { type: 'varchar', length: 12 },
  },
});

export const SesionEjercicioSchema = new EntitySchema<SesionEjercicioFila>({
  name: 'SesionEjercicio',
  tableName: 'sesion_ejercicios',
  columns: {
    sesionId: { name: 'sesion_id', type: 'uuid', primary: true },
    orden: { type: 'int', primary: true },
    ejercicioId: { name: 'ejercicio_id', type: 'uuid' },
    omitido: { type: 'boolean' },
  },
});

export const SesionSerieSchema = new EntitySchema<SesionSerieFila>({
  name: 'SesionSerie',
  tableName: 'sesion_series',
  columns: {
    sesionId: { name: 'sesion_id', type: 'uuid', primary: true },
    ordenEjercicio: { name: 'orden_ejercicio', type: 'int', primary: true },
    orden: { type: 'int', primary: true },
    completada: { type: 'boolean' },
    repeticiones: { type: 'int', nullable: true },
    carga: { type: 'numeric', precision: 7, scale: 2, nullable: true, transformer: numerico },
    duracionSegundos: { name: 'duracion_segundos', type: 'int', nullable: true },
    objetivoRepeticiones: { name: 'objetivo_repeticiones', type: 'int', nullable: true },
    objetivoCarga: { name: 'objetivo_carga', type: 'numeric', precision: 7, scale: 2, nullable: true, transformer: numerico },
    objetivoDuracionSegundos: { name: 'objetivo_duracion_segundos', type: 'int', nullable: true },
  },
});