import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_URL } from '../config/entorno';
import { DatosRutina, OrigenRutina, Rutina } from '../models/rutina.model';
interface RutinaApi {
  id: string;
  nombre: string;
  origen: OrigenRutina;
  ejercicios: {
    orden: number;
    ejercicio_id: string;
    series: { orden: number; repeticiones: number | null; carga: number | null; duracion_segundos: number | null }[];
  }[];
}

const aRutina = (r: RutinaApi): Rutina => ({
  id: r.id,
  nombre: r.nombre,
  origen: r.origen,
  ejercicios: r.ejercicios.map((e) => ({
    orden: e.orden,
    ejercicioId: e.ejercicio_id,
    series: e.series.map((s) => ({
      orden: s.orden,
      repeticiones: s.repeticiones,
      carga: s.carga,
      duracionSegundos: s.duracion_segundos,
    })),
  })),
});

const aCuerpo = (d: DatosRutina) => ({
  nombre: d.nombre,
  ejercicios: d.ejercicios.map((e) => ({
    ejercicio_id: e.ejercicioId,
    series: e.series.map((s) => ({
      repeticiones: s.repeticiones,
      carga: s.carga,
      duracion_segundos: s.duracionSegundos,
    })),
  })),
});

@Injectable({ providedIn: 'root' })
export class RutinasService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_URL}/rutinas`;

  listarPropias(): Observable<Rutina[]> {
    return this.http.get<RutinaApi[]>(this.base).pipe(map((l) => l.map(aRutina)));
  }

  listarPredefinidas(): Observable<Rutina[]> {
    return this.http.get<RutinaApi[]>(`${this.base}/predefinidas`).pipe(map((l) => l.map(aRutina)));
  }

  ver(id: string): Observable<Rutina> {
    return this.http.get<RutinaApi>(`${this.base}/${id}`).pipe(map(aRutina));
  }
  
  crear(datos: DatosRutina): Observable<Rutina> {
    return this.http.post<RutinaApi>(this.base, aCuerpo(datos)).pipe(map(aRutina));
  }

  modificar(id: string, datos: DatosRutina): Observable<Rutina> {
    return this.http.put<RutinaApi>(`${this.base}/${id}`, aCuerpo(datos)).pipe(map(aRutina));
  }

  usar(id: string): Observable<Rutina> {
    return this.http.post<RutinaApi>(`${this.base}/${id}/usar`, {}).pipe(map(aRutina));
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}