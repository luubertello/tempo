import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonLabel, IonSegment, IonSegmentButton, IonSpinner } from '@ionic/angular';
import { finalize } from 'rxjs';
import { ResumenSesion } from '../../core/models/sesion.model';
import { SesionesService } from '../../core/services/sesiones.service';
import { mensajeDeError } from '../../core/utils/errores';
import { formatoFecha, isoHaceDias, plural } from '../../core/utils/formato';
import { CalendarioMesComponent } from '../../shared/components/calendario-mes/calendario-mes.component';
import { CompasComponent } from '../../shared/components/compas/compas.component';

type Filtro = 'todos' | 'FINALIZADA' | 'ABANDONADA';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrl: './historial.page.scss',
  imports: [
    IonContent, IonSegment, IonSegmentButton, IonLabel, IonSpinner, IonButton,
    RouterLink, CompasComponent, CalendarioMesComponent,
  ],
})
export class HistorialPage {
  private readonly api = inject(SesionesService);

  readonly filtro = signal<Filtro>('todos');
  readonly diaElegido = signal<string | null>(null);
  readonly todas = signal<ResumenSesion[]>([]);
  readonly hoy = signal(isoHaceDias(0));
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  readonly entrenados = computed(
    () => new Set(this.todas().filter((s) => s.estado === 'FINALIZADA').map((s) => s.fechaSesion)),
  );

  readonly visibles = computed(() => {
    let lista = this.todas();
    const filtro = this.filtro();
    if (filtro !== 'todos') lista = lista.filter((s) => s.estado === filtro);
    const dia = this.diaElegido();
    if (dia) lista = lista.filter((s) => s.fechaSesion === dia);
    return lista;
  });

  readonly diaPasadoElegido = computed(() => {
    const dia = this.diaElegido();
    return dia !== null && dia < this.hoy();
  });

  readonly formatoFecha = formatoFecha;

  ionViewWillEnter(): void {
    this.hoy.set(isoHaceDias(0));
    this.cargar();
  }

  cargar(): void {
    this.error.set(null);
    this.cargando.set(true);
    this.api
      .listar()
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (lista) => this.todas.set(lista),
        error: (e) => this.error.set(mensajeDeError(e)),
      });
  }

  cambiarFiltro(evento: Event): void {
    this.filtro.set((evento as CustomEvent).detail.value as Filtro);
  }

  elegirDia(iso: string): void {
    this.diaElegido.set(this.diaElegido() === iso ? null : iso);
  }

  titulo(s: ResumenSesion): string {
    return s.nombreRutina ?? 'Entrenamiento libre';
  }

  resumen(s: ResumenSesion): string {
    return `${plural(s.cantidadEjercicios, 'ejercicio', 'ejercicios')}, ${plural(s.seriesCompletadas, 'serie completada', 'series completadas')}`;
  }

  destino(s: ResumenSesion): string[] {
    return s.estado === 'EN_CURSO' ? ['/entrenar'] : ['/historial', s.id];
  }
}