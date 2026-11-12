import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { API_URL } from '../config/entorno';
import { DatosSerie } from '../models/rutina.model';
import { EstadoSesion, ObjetivoSerie, ResultadoEjercicio, Sesion } from '../models/sesion.model';

interface ObjetivoApi {
  repeticiones: number | null;
  carga: number | null;
  duracion_segundos: number | null;
}
interface SesionApi {
  id: string;
  rutina_id: string | null;
  nombre_rutina: string | null;
  fecha_sesion: string;
  fecha_registro: string;
  estado: EstadoSesion;
  ejercicios: {
    orden: number;
    ejercicio_id: string;
    omitido: boolean;
    resultado: ResultadoEjercicio;
    series: {
      orden: number;
      completada: boolean;
      repeticiones: number | null;
      carga: number | null;
      duracion_segundos: number | null;
      objetivo: ObjetivoApi | null;
    }[];
  }[];
}

const aObjetivo = (o: ObjetivoApi | null): ObjetivoSerie | null =>
  o ? { repeticiones: o.repeticiones, carga: o.carga, duracionSegundos: o.duracion_segundos } : null;

const aSesion = (s: SesionApi): Sesion => ({
  id: s.id,
  rutinaId: s.rutina_id,
  nombreRutina: s.nombre_rutina,
  fechaSesion: s.fecha_sesion,
  fechaRegistro: s.fecha_registro,
  estado: s.estado,
  ejercicios: s.ejercicios.map((e) => ({
    orden: e.orden,
    ejercicioId: e.ejercicio_id,
    omitido: e.omitido,
    resultado: e.resultado,
    series: e.series.map((x) => ({
      orden: x.orden,
      completada: x.completada,
      repeticiones: x.repeticiones,
      carga: x.carga,
      duracionSegundos: x.duracion_segundos,
      objetivo: aObjetivo(x.objetivo),
    })),
  })),
});

@Injectable({ providedIn: 'root' })
export class SesionesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_URL}/sesiones`;

  enCurso(): Observable<Sesion | null> {
    return this.http.get<SesionApi>(`${this.base}/en-curso`).pipe(
      map(aSesion),
      catchError((e) => (e instanceof HttpErrorResponse && e.status === 404 ? of(null) : throwError(() => e))),
    );
  }

  ver(id: string): Observable<Sesion> {
    return this.http.get<SesionApi>(`${this.base}/${id}`).pipe(map(aSesion));
  }

  iniciar(rutinaId?: string): Observable<Sesion> {
    return this.http.post<SesionApi>(this.base, rutinaId ? { rutina_id: rutinaId } : {}).pipe(map(aSesion));
  }

  agregarEjercicio(id: string, ejercicioId: string): Observable<Sesion> {
    return this.http.post<SesionApi>(`${this.base}/${id}/ejercicios`, { ejercicio_id: ejercicioId }).pipe(map(aSesion));
  }

  registrarSerie(id: string, orden: number, datos: DatosSerie): Observable<void> {
    return this.http
      .post(`${this.base}/${id}/ejercicios/${orden}/series`, {
        repeticiones: datos.repeticiones,
        carga: datos.carga,
        duracion_segundos: datos.duracionSegundos,
      })
      .pipe(map(() => undefined));
  }

  omitirEjercicio(id: string, orden: number): Observable<void> {
    return this.http.post(`${this.base}/${id}/ejercicios/${orden}/omitir`, {}).pipe(map(() => undefined));
  }

  finalizar(id: string): Observable<Sesion> {
    return this.http.post<SesionApi>(`${this.base}/${id}/finalizar`, {}).pipe(map(aSesion));
  }

  abandonar(id: string): Observable<Sesion> {
    return this.http.post<SesionApi>(`${this.base}/${id}/abandonar`, {}).pipe(map(aSesion));
  }
}