import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonLabel, IonSegment, IonSegmentButton, IonSpinner } from '@ionic/angular';
import { finalize } from 'rxjs';
import { EstadoSesion, ResumenSesion } from '../../core/models/sesion.model';
import { SesionesService } from '../../core/services/sesiones.service';
import { mensajeDeError } from '../../core/utils/errores';
import { formatoFecha, plural } from '../../core/utils/formato';
import { CompasComponent } from '../../shared/components/compas/compas.component';

type Filtro = 'todos' | 'FINALIZADA' | 'ABANDONADA';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrl: './historial.page.scss',
  imports: [IonContent, IonSegment, IonSegmentButton, IonLabel, IonSpinner, IonButton, RouterLink, CompasComponent],
})
export class HistorialPage {
  private readonly api = inject(SesionesService);

  readonly filtro = signal<Filtro>('todos');
  readonly sesiones = signal<ResumenSesion[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  readonly formatoFecha = formatoFecha;

  ionViewWillEnter(): void {
    this.cargar();
  }

  cargar(): void {
    this.error.set(null);
    this.cargando.set(true);
    const estado = this.filtro() === 'todos' ? undefined : (this.filtro() as EstadoSesion);
    this.api
      .listar(estado)
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (lista) => this.sesiones.set(lista),
        error: (e) => this.error.set(mensajeDeError(e)),
      });
  }

  cambiarFiltro(evento: Event): void {
    this.filtro.set((evento as CustomEvent).detail.value as Filtro);
    this.cargar();
  }

  titulo(s: ResumenSesion): string {
    return s.nombreRutina ?? 'Entrenamiento libre';
  }

  resumen(s: ResumenSesion): string {
    return `${plural(s.cantidadEjercicios, 'ejercicio', 'ejercicios')}, ${plural(s.seriesCompletadas, 'serie completada', 'series completadas')}`;
  }

  // Un entrenamiento en curso se retoma desde Entrenar; el resto se abre en el detalle.
  destino(s: ResumenSesion): string[] {
    return s.estado === 'EN_CURSO' ? ['/entrenar'] : ['/historial', s.id];
  }
}