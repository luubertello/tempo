import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable, switchMap, tap } from 'rxjs';
import { API_URL } from '../config/entorno';

const CLAVE_TOKEN = 'tempo.token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _token = signal<string | null>(localStorage.getItem(CLAVE_TOKEN));
  readonly token = this._token.asReadonly();
  readonly autenticado = computed(() => this._token() !== null);

  login(email: string, password: string): Observable<void> {
    return this.http.post<{ token: string }>(`${API_URL}/auth/login`, { email, password }).pipe(
      tap((r) => this.guardar(r.token)),
      map(() => undefined),
    );
  }

  registrar(email: string, password: string): Observable<void> {
    return this.http
      .post(`${API_URL}/auth/registro`, { email, password })
      .pipe(switchMap(() => this.login(email, password)));
  }

  salir(): void {
    localStorage.removeItem(CLAVE_TOKEN);
    this._token.set(null);
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  private guardar(token: string): void {
    localStorage.setItem(CLAVE_TOKEN, token);
    this._token.set(token);
  }
}