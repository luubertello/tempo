import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import type { Response } from 'express';
import {
  ErrorDeConflicto,
  ErrorDeDominio,
  ErrorDeReglaViolada,
  ErrorNoAutenticado,
  ErrorNoEncontrado,
  ErrorProhibido,
} from '../domain/errores';

// Convierte cualquier error en { "error": "mensaje legible" }
@Catch()
export class FiltroDeErrores implements ExceptionFilter {
  private readonly logger = new Logger(FiltroDeErrores.name);

  catch(excepcion: unknown, host: ArgumentsHost): void {
    const respuesta = host.switchToHttp().getResponse<Response>();
    const { status, mensaje } = this.traducir(excepcion);
    if (status >= 500) this.logger.error(excepcion);
    respuesta.status(status).json({ error: mensaje });
  }

  private traducir(e: unknown): { status: number; mensaje: string } {
    if (e instanceof ErrorDeDominio) {
      return { status: this.statusDe(e), mensaje: e.message };
    }
    if (e instanceof HttpException) {
      const status = e.getStatus();
      if (status === 401) return { status, mensaje: 'Falta el token o es inválido.' };
      const cuerpo = e.getResponse();
      const msg = typeof cuerpo === 'string' ? cuerpo : (cuerpo as { message?: string | string[] }).message;
      return { status, mensaje: Array.isArray(msg) ? msg.join('; ') : (msg ?? e.message) };
    }
    return { status: 500, mensaje: 'Error interno del servidor.' };
  }

  private statusDe(e: ErrorDeDominio): number {
    if (e instanceof ErrorNoAutenticado) return 401;
    if (e instanceof ErrorProhibido) return 403;
    if (e instanceof ErrorNoEncontrado) return 404;
    if (e instanceof ErrorDeConflicto) return 409;
    if (e instanceof ErrorDeReglaViolada) return 422;
    return 500;
  }
}