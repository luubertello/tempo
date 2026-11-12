import { Routes } from '@angular/router';
import { authGuard, soloInvitadoGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [soloInvitadoGuard],
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'registro',
    canActivate: [soloInvitadoGuard],
    loadComponent: () => import('./pages/registro/registro.page').then((m) => m.RegistroPage),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      { path: 'entrenar', data: { titulo: 'Entrenar' }, loadComponent: () => import('./pages/pronto/pronto.page').then((m) => m.ProntoPage) },
      { path: 'rutinas', loadComponent: () => import('./pages/rutinas/rutinas.page').then((m) => m.RutinasPage) },
      { path: 'rutinas/:id', loadComponent: () => import('./pages/rutina-detalle/rutina-detalle.page').then((m) => m.RutinaDetallePage) },
      { path: 'historial', data: { titulo: 'Historial' }, loadComponent: () => import('./pages/pronto/pronto.page').then((m) => m.ProntoPage) },
      { path: 'progreso', data: { titulo: 'Progreso' }, loadComponent: () => import('./pages/pronto/pronto.page').then((m) => m.ProntoPage) },
      { path: '', redirectTo: 'entrenar', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '' },
];