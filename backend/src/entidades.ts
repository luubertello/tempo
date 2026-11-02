import { EjercicioSchema } from "./catalogo/infrastructure/ejercicio.schema";
import { RutinaEjercicioSchema, RutinaSchema, RutinaSerieSchema } from "./entrenamiento/infrastructure/rutina.schemas";
import { UsuarioSchema } from './identidad/infrastructure/usuario.schema';

// Lista unica de entidades, usada por la app y por el CLI de migraciones
export const ENTIDADES = [EjercicioSchema, UsuarioSchema, RutinaSchema, RutinaEjercicioSchema, RutinaSerieSchema];