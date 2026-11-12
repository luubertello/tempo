import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonLabel, IonSegment, IonSegmentButton, IonSpinner } from '@ionic/angular';
import { finalize, forkJoin } from 'rxjs';
import { Rutina } from '../../core/models/rutina.model';
import { RutinasService } from '../../core/services/rutinas.service';
import { mensajeDeError } from '../../core/utils/errores';
import { plural } from '../../core/utils/formato';
import { CompasComponent } from '../../shared/components/compas/compas.component';

type Segmento = 'mias' | 'predefinidas';

@Component({
  selector: 'app-rutinas',
  templateUrl: './rutinas.page.html',
  styleUrl: './rutinas.page.scss',
  imports: [IonContent, IonSegment, IonSegmentButton, IonLabel, IonSpinner, IonButton, RouterLink, CompasComponent],
})
export class RutinasPage {
  private readonly api = inject(RutinasService);

  readonly segmento = signal<Segmento>('mias');
  readonly mias = signal<Rutina[]>([]);
  readonly predefinidas = signal<Rutina[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  readonly visibles = computed(() => (this.segmento() === 'mias' ? this.mias() : this.predefinidas()));

  ionViewWillEnter(): void {
    this.cargar();
  }

  cargar(): void {
    this.error.set(null);
    this.cargando.set(true);
    forkJoin({ mias: this.api.listarPropias(), predefinidas: this.api.listarPredefinidas() })
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (r) => {
          this.mias.set(r.mias);
          this.predefinidas.set(r.predefinidas);
        },
        error: (e) => this.error.set(mensajeDeError(e)),
      });
  }

  cambiarSegmento(evento: Event): void {
    this.segmento.set((evento as CustomEvent).detail.value as Segmento);
  }

  totalSeries(r: Rutina): number {
    return r.ejercicios.reduce((n, e) => n + e.series.length, 0);
  }

  resumen(r: Rutina): string {
    return `${plural(r.ejercicios.length, 'ejercicio', 'ejercicios')}, ${plural(this.totalSeries(r), 'serie', 'series')}`;
  }
}