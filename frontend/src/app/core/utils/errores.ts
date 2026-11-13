import { HttpErrorResponse } from '@angular/common/http';
import { API_URL } from '../config/entorno';

export function mensajeDeError(e: unknown): string {
  if (e instanceof HttpErrorResponse) {
    if (e.status === 0) return `No se pudo conectar con el servidor (${API_URL}).`;
    const cuerpo = e.error as { error?: string } | null;
    if (cuerpo?.error) return cuerpo.error;
  }
  return 'No se pudo completar la acción. Probá de nuevo.';
}