import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_URL } from '../config/entorno';
import { Evolucion, ResumenEjercicio, Unidad } from '../models/estadistica.model';

interface ResumenApi {
  ejercicio_id: string;
  nombre: string;
  unidad: Unidad;
  veces_realizado: number;
  marca_maxima: number;
}
interface EvolucionApi {
  ejercicio_id: string;
  nombre: string;
  unidad: Unidad;
  puntos: { fecha_sesion: string; valor: number }[];
}

@Injectable({ providedIn: 'root' })
export class EstadisticasService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_URL}/estadisticas/ejercicios`;

  resumen(): Observable<ResumenEjercicio[]> {
    return this.http.get<ResumenApi[]>(this.base).pipe(
      map((lista) =>
        lista.map((r) => ({
          ejercicioId: r.ejercicio_id,
          nombre: r.nombre,
          unidad: r.unidad,
          vecesRealizado: r.veces_realizado,
          marcaMaxima: r.marca_maxima,
        })),
      ),
    );
  }

  evolucion(ejercicioId: string, desde?: string): Observable<Evolucion> {
    return this.http
      .get<EvolucionApi>(`${this.base}/${ejercicioId}/evolucion`, { params: desde ? { desde } : {} })
      .pipe(
        map((e) => ({
          ejercicioId: e.ejercicio_id,
          nombre: e.nombre,
          unidad: e.unidad,
          puntos: e.puntos.map((p) => ({ fechaSesion: p.fecha_sesion, valor: p.valor })),
        })),
      );
  }
}