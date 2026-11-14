import { Balance } from '../domain/balance';
import { EjercicioRealizado } from '../domain/ejercicio-realizado';
import { Sesion } from '../domain/sesion';
import { SerieRealizada } from '../domain/serie-realizada';

export const aRespuestaBalance = (b: Balance) => ({
  planificadas: b.planificadas,
  logradas: b.logradas,
  cumplidas: b.cumplidas,
  superadas: b.superadas,
  por_debajo: b.porDebajo,
  distintas: b.distintas,
  sin_hacer: b.sinHacer,
  extras: b.extras,
  hechas: b.hechas,
});

export const aRespuestaSerie = (s: SerieRealizada) => {
  const dif = s.diferencia();
  return {
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
    veredicto: s.veredicto(), 
    diferencia: dif
      ? { repeticiones: dif.repeticiones, carga: dif.carga, duracion_segundos: dif.duracionSegundos }
      : null,
  };
};

export const aRespuestaEjercicio = (e: EjercicioRealizado) => ({
  orden: e.orden,
  ejercicio_id: e.ejercicioId,
  omitido: e.omitido,
  resultado: e.resultado(), 
  balance: aRespuestaBalance(e.balance()),
  series: e.series.map(aRespuestaSerie),
});

export const aRespuestaSesion = (s: Sesion) => ({
  id: s.id,
  rutina_id: s.rutinaId,
  nombre_rutina: s.nombreRutina,
  fecha_sesion: s.fechaSesion,
  fecha_registro: s.fechaRegistro.toISOString(),
  estado: s.estado,
  balance: aRespuestaBalance(s.balance()),
  ejercicios: s.ejercicios.map(aRespuestaEjercicio),
});

export const aResumenSesion = (s: Sesion) => ({
  id: s.id,
  rutina_id: s.rutinaId,
  nombre_rutina: s.nombreRutina,
  fecha_sesion: s.fechaSesion,
  fecha_registro: s.fechaRegistro.toISOString(),
  estado: s.estado,
  cantidad_ejercicios: s.ejercicios.length,
  series_completadas: s.cantidadSeriesCompletadas(),
  balance: aRespuestaBalance(s.balance()),
});