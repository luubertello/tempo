import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import { API_URL } from '../config/entorno';
import { Ejercicio, TipoMedicion } from '../models/ejercicio.model';

interface EjercicioApi {
  id: string;
  nombre: string;
  tipo_medicion: TipoMedicion;
}

@Injectable({ providedIn: 'root' })
export class EjerciciosService {
  private readonly http = inject(HttpClient);
  private catalogo$?: Observable<Ejercicio[]>;

  listar(): Observable<Ejercicio[]> {
    this.catalogo$ ??= this.http.get<EjercicioApi[]>(`${API_URL}/ejercicios`).pipe(
      map((lista) => lista.map((e) => ({ id: e.id, nombre: e.nombre, tipoMedicion: e.tipo_medicion }))),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    return this.catalogo$;
  }
}