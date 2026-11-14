import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { API_URL } from '../config/entorno';
import { DatosSerie } from '../models/rutina.model';
import {
  Balance,
  DatosSesionPasada,
  Diferencia,
  EstadoSesion,
  ObjetivoSerie,
  ResultadoEjercicio,
  ResumenSesion,
  Sesion,
  Veredicto,
} from '../models/sesion.model';

interface MedidasApi {
  repeticiones: number | null;
  carga: number | null;
  duracion_segundos: number | null;
}
interface BalanceApi {
  planificadas: number;
  logradas: number;
  cumplidas: number;
  superadas: number;
  por_debajo: number;
  distintas: number;
  sin_hacer: number;
  extras: number;
  hechas: number;
}
interface SesionApi {
  id: string;
  rutina_id: string | null;
  nombre_rutina: string | null;
  fecha_sesion: string;
  fecha_registro: string;
  estado: EstadoSesion;
  balance: BalanceApi;
  ejercicios: {
    orden: number;
    ejercicio_id: string;
    omitido: boolean;
    resultado: ResultadoEjercicio;
    balance: BalanceApi;
    series: {
      orden: number;
      completada: boolean;
      repeticiones: number | null;
      carga: number | null;
      duracion_segundos: number | null;
      objetivo: MedidasApi | null;
      veredicto: Veredicto;
      diferencia: MedidasApi | null;
    }[];
  }[];
}
interface ResumenApi {
  id: string;
  rutina_id: string | null;
  nombre_rutina: string | null;
  fecha_sesion: string;
  estado: EstadoSesion;
  cantidad_ejercicios: number;
  series_completadas: number;
  balance: BalanceApi;
}

const aMedidas = (m: MedidasApi | null): (ObjetivoSerie & Diferencia) | null =>
  m ? { repeticiones: m.repeticiones, carga: m.carga, duracionSegundos: m.duracion_segundos } : null;

const aBalance = (b: BalanceApi): Balance => ({
  planificadas: b.planificadas,
  logradas: b.logradas,
  cumplidas: b.cumplidas,
  superadas: b.superadas,
  porDebajo: b.por_debajo,
  distintas: b.distintas,
  sinHacer: b.sin_hacer,
  extras: b.extras,
  hechas: b.hechas,
});

const aSesion = (s: SesionApi): Sesion => ({
  id: s.id,
  rutinaId: s.rutina_id,
  nombreRutina: s.nombre_rutina,
  fechaSesion: s.fecha_sesion,
  fechaRegistro: s.fecha_registro,
  estado: s.estado,
  balance: aBalance(s.balance),
  ejercicios: s.ejercicios.map((e) => ({
    orden: e.orden,
    ejercicioId: e.ejercicio_id,
    omitido: e.omitido,
    resultado: e.resultado,
    balance: aBalance(e.balance),
    series: e.series.map((x) => ({
      orden: x.orden,
      completada: x.completada,
      repeticiones: x.repeticiones,
      carga: x.carga,
      duracionSegundos: x.duracion_segundos,
      objetivo: aMedidas(x.objetivo),
      veredicto: x.veredicto,
      diferencia: aMedidas(x.diferencia),
    })),
  })),
});

@Injectable({ providedIn: 'root' })
export class SesionesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_URL}/sesiones`;

  // El back responde 404 cuando no hay entrenamiento en curso: acá eso es "null", no un error.
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

  // Nace finalizada. Si trae rutina, el back copia el objetivo por posición.
  registrarPasada(d: DatosSesionPasada): Observable<Sesion> {
    return this.http
      .post<SesionApi>(`${this.base}/pasadas`, {
        fecha_sesion: d.fecha,
        rutina_id: d.rutinaId,
        ejercicios: d.ejercicios.map((e) => ({
          ejercicio_id: e.ejercicioId,
          omitido: e.omitido,
          series: e.series.map((s) => ({
            completada: s.completada,
            repeticiones: s.repeticiones,
            carga: s.carga,
            duracion_segundos: s.duracionSegundos,
          })),
        })),
      })
      .pipe(map(aSesion));
  }

  agregarEjercicio(id: string, ejercicioId: string): Observable<Sesion> {
    return this.http.post<SesionApi>(`${this.base}/${id}/ejercicios`, { ejercicio_id: ejercicioId }).pipe(map(aSesion));
  }

  // Registrar siempre significa "se hizo": completa la primera serie pendiente o agrega una extra.
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

  // Más recientes primero (lo ordena el back).
  listar(estado?: EstadoSesion): Observable<ResumenSesion[]> {
    return this.http.get<ResumenApi[]>(this.base, { params: estado ? { estado } : {} }).pipe(
      map((lista) =>
        lista.map((r) => ({
          id: r.id,
          rutinaId: r.rutina_id,
          nombreRutina: r.nombre_rutina,
          fechaSesion: r.fecha_sesion,
          estado: r.estado,
          cantidadEjercicios: r.cantidad_ejercicios,
          seriesCompletadas: r.series_completadas,
          balance: aBalance(r.balance),
        })),
      ),
    );
  }

  // Con "datos" pisa los valores reales; con completada = false la marca como no hecha.
  corregirSerie(
    id: string,
    ordenEjercicio: number,
    ordenSerie: number,
    cambios: { completada?: boolean; datos?: DatosSerie },
  ): Observable<void> {
    return this.http
      .patch(`${this.base}/${id}/ejercicios/${ordenEjercicio}/series/${ordenSerie}`, {
        completada: cambios.completada,
        repeticiones: cambios.datos?.repeticiones,
        carga: cambios.datos?.carga,
        duracion_segundos: cambios.datos?.duracionSegundos,
      })
      .pipe(map(() => undefined));
  }

  quitarSerie(id: string, ordenEjercicio: number, ordenSerie: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}/ejercicios/${ordenEjercicio}/series/${ordenSerie}`);
  }

  quitarEjercicio(id: string, ordenEjercicio: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}/ejercicios/${ordenEjercicio}`);
  }

  cambiarFecha(id: string, fecha: string): Observable<void> {
    return this.http.patch(`${this.base}/${id}`, { fecha_sesion: fecha }).pipe(map(() => undefined));
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}