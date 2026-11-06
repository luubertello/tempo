import { ResumenDeEjercicio } from '../domain/calculos';
import { EvolucionDeEjercicio } from '../application/evolucion-de-ejercicio.caso-de-uso';

export const aRespuestaResumen = (r: ResumenDeEjercicio) => ({
  ejercicio_id: r.ejercicioId,
  nombre: r.nombre,
  unidad: r.unidad,
  veces_realizado: r.vecesRealizado,
  marca_maxima: r.marcaMaxima,
});

export const aRespuestaEvolucion = (e: EvolucionDeEjercicio) => ({
  ejercicio_id: e.ejercicioId,
  nombre: e.nombre,
  unidad: e.unidad,
  puntos: e.puntos.map((p) => ({ fecha_sesion: p.fechaSesion, valor: p.valor })),
});