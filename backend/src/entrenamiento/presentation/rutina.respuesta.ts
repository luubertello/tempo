import { Rutina } from '../domain/rutina';
import { RutinaDto } from './rutina.dto';
import { DatosEjercicio } from '../domain/rutina';

export const aRespuesta = (r: Rutina) => ({
  id: r.id,
  nombre: r.nombre,
  origen: r.origen,
  ejercicios: r.ejercicios.map((e) => ({
    orden: e.orden,
    ejercicio_id: e.ejercicioId,
    series: e.series.map((s, i) => ({
      orden: i + 1,
      repeticiones: s.repeticiones,
      carga: s.carga,
      duracion_segundos: s.duracionSegundos,
    })),
  })),
});

export const aDatosDeEjercicios = (dto: RutinaDto): DatosEjercicio[] =>
  dto.ejercicios.map((e) => ({
    ejercicioId: e.ejercicio_id,
    series: e.series.map((s) => ({
      repeticiones: s.repeticiones,
      carga: s.carga,
      duracionSegundos: s.duracion_segundos,
    })),
  }));