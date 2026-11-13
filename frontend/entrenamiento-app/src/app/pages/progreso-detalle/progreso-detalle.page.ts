import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonToolbar,
} from '@ionic/angular';
import { finalize } from 'rxjs';
import { Evolucion } from '../../core/models/estadistica.model';
import { EstadisticasService } from '../../core/services/estadisticas.service';
import { mensajeDeError } from '../../core/utils/errores';
import { fechaCorta, formatoValor, isoHaceDias, plural } from '../../core/utils/formato';
import { GraficoEvolucionComponent } from '../../shared/components/grafico-evolucion/grafico-evolucion.component';

type Periodo = 'todo' | '90' | '30';

@Component({
  selector: 'app-progreso-detalle',
  templateUrl: './progreso-detalle.page.html',
  styleUrl: './progreso-detalle.page.scss',
  imports: [
    IonHeader, IonToolbar, IonButtons, IonBackButton, IonContent, IonSegment,
    IonSegmentButton, IonLabel, IonSpinner, IonButton, GraficoEvolucionComponent,
  ],
})
export class ProgresoDetallePage {
  private readonly api = inject(EstadisticasService);
  private readonly route = inject(ActivatedRoute);

  readonly periodo = signal<Periodo>('todo');
  readonly evolucion = signal<Evolucion | null>(null);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  readonly marca = computed(() => {
    const p = this.evolucion()?.puntos ?? [];
    return p.length === 0 ? null : Math.max(...p.map((x) => x.valor));
  });

  readonly etiquetaMarca = computed(() => (this.periodo() === 'todo' ? 'Marca máxima' : 'Mejor marca del período'));

  readonly resumen = computed(() => {
    const e = this.evolucion();
    const ultimo = e?.puntos.at(-1);
    if (!e || !ultimo) return '';
    const dias = plural(e.puntos.length, 'día', 'días');
    return `Último registro: ${formatoValor(ultimo.valor, e.unidad)} el ${fechaCorta(ultimo.fechaSesion)}. ${dias} con este ejercicio en el período.`;
  });

  readonly formatoValor = formatoValor;

  ionViewWillEnter(): void {
    this.cargar();
  }

  cargar(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    const desde = this.periodo() === 'todo' ? undefined : isoHaceDias(Number(this.periodo()));
    this.error.set(null);
    this.cargando.set(true);
    this.api
      .evolucion(id, desde)
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (e) => this.evolucion.set(e),
        error: (e) => this.error.set(mensajeDeError(e)),
      });
  }

  cambiarPeriodo(evento: Event): void {
    this.periodo.set((evento as CustomEvent).detail.value as Periodo);
    this.cargar();
  }
}