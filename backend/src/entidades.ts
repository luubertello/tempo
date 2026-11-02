import { EjercicioSchema } from "./catalogo/infrastructure/ejercicio.schema";
import { RutinaEjercicioSchema, RutinaSchema, RutinaSerieSchema } from "./entrenamiento/infrastructure/rutina.schemas";
import { SesionEjercicioSchema, SesionSchema, SesionSerieSchema } from "./entrenamiento/infrastructure/sesion.schemas";
import { UsuarioSchema } from './identidad/infrastructure/usuario.schema';

export const ENTIDADES = [
    EjercicioSchema, UsuarioSchema, 
    RutinaSchema, RutinaEjercicioSchema, RutinaSerieSchema, 
    SesionSchema, SesionEjercicioSchema, SesionSerieSchema];