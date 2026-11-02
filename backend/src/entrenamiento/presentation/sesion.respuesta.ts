import { EjercicioRealizado } from '../domain/ejercicio-realizado';
import { Sesion } from '../domain/sesion';
import { SerieRealizada } from '../domain/serie-realizada';

export const aRespuestaSerie = (s: SerieRealizada) => ({
  orden: s.orden,
  completada: s.completada,
  repeticiones: s.repeticiones,
  carga: s.carga,
  duracion_segundos: s.duracionSegundos,
  objetivo: s.objetivo
    ? {
        repeticiones: s.objetivo.repeticiones,
        carga: s.objetivo.carga,
        duracion_segundos: s.objetivo.duracionSegundos,
      }
    : null,
});

export const aRespuestaEjercicio = (e: EjercicioRealizado) => ({
  orden: e.orden,
  ejercicio_id: e.ejercicioId,
  omitido: e.omitido,
  resultado: e.resultado(), 
  series: e.series.map(aRespuestaSerie),
});

export const aRespuestaSesion = (s: Sesion) => ({
  id: s.id,
  rutina_id: s.rutinaId,
  nombre_rutina: s.nombreRutina,
  fecha_sesion: s.fechaSesion,
  fecha_registro: s.fechaRegistro.toISOString(),
  estado: s.estado,
  ejercicios: s.ejercicios.map(aRespuestaEjercicio),
});