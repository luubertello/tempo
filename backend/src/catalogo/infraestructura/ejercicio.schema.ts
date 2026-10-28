import { EntitySchema } from 'typeorm';

// Fila de la tabla. Es un tipo de infraestructura: el dominio no lo conoce.
export interface EjercicioFila {
  id: string;
  nombre: string;
  tipoMedicion: string;
}

export const EjercicioSchema = new EntitySchema<EjercicioFila>({
  name: 'Ejercicio',
  tableName: 'ejercicios',
  columns: {
    id: { type: 'uuid', primary: true },
    nombre: { type: 'varchar', length: 100, unique: true },
    tipoMedicion: { name: 'tipo_medicion', type: 'varchar', length: 30 },
  },
});