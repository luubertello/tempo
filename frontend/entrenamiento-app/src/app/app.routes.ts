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
      { path: 'entrenar', loadComponent: () => import('./pages/entrenar/entrenar.page').then((m) => m.EntrenarPage) },
      { path: 'rutinas', loadComponent: () => import('./pages/rutinas/rutinas.page').then((m) => m.RutinasPage) },
      { path: 'rutinas/nueva', loadComponent: () => import('./pages/rutina-form/rutina-form.page').then((m) => m.RutinaFormPage) },
      { path: 'rutinas/:id/editar', loadComponent: () => import('./pages/rutina-form/rutina-form.page').then((m) => m.RutinaFormPage) },
      { path: 'rutinas/:id', loadComponent: () => import('./pages/rutina-detalle/rutina-detalle.page').then((m) => m.RutinaDetallePage) },
      { path: 'historial', loadComponent: () => import('./pages/historial/historial.page').then((m) => m.HistorialPage) },
      { path: 'historial/:id', loadComponent: () => import('./pages/historial-detalle/historial-detalle.page').then((m) => m.HistorialDetallePage) },
      { path: 'progreso', data: { titulo: 'Progreso' }, loadComponent: () => import('./pages/pronto/pronto.page').then((m) => m.ProntoPage) },
      { path: '', redirectTo: 'entrenar', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '' },
];