import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () =>
  inject(AuthService).autenticado() ? true : inject(Router).createUrlTree(['/login']);

export const soloInvitadoGuard: CanActivateFn = () =>
  inject(AuthService).autenticado() ? inject(Router).createUrlTree(['/entrenar']) : true;