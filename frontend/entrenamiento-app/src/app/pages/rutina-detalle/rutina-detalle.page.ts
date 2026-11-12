import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AlertController,
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonSpinner,
  IonToolbar,
} from '@ionic/angular';
import { finalize, forkJoin } from 'rxjs';
import { Ejercicio } from '../../core/models/ejercicio.model';
import { Rutina } from '../../core/models/rutina.model';
import { EjerciciosService } from '../../core/services/ejercicios.service';
import { RutinasService } from '../../core/services/rutinas.service';
import { mensajeDeError } from '../../core/utils/errores';
import { plural, textoSerie } from '../../core/utils/formato';

@Component({
  selector: 'app-rutina-detalle',
  templateUrl: './rutina-detalle.page.html',
  styleUrl: './rutina-detalle.page.scss',
  imports: [IonHeader, IonToolbar, IonButtons, IonBackButton, IonContent, IonButton, IonSpinner],
})
export class RutinaDetallePage {
  private readonly rutinas = inject(RutinasService);
  private readonly ejercicios = inject(EjerciciosService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly alertas = inject(AlertController);

  readonly rutina = signal<Rutina | null>(null);
  readonly catalogo = signal<Map<string, Ejercicio>>(new Map());
  readonly error = signal<string | null>(null);
  readonly errorAccion = signal<string | null>(null);
  readonly trabajando = signal(false);

  readonly esPredefinida = computed(() => this.rutina()?.origen === 'PREDEFINIDA');
  readonly textoSerie = textoSerie;

  ionViewWillEnter(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.rutina.set(null);
    this.error.set(null);
    this.errorAccion.set(null);

    forkJoin({ rutina: this.rutinas.ver(id), ejercicios: this.ejercicios.listar() }).subscribe({
      next: ({ rutina, ejercicios }) => {
        this.catalogo.set(new Map(ejercicios.map((e) => [e.id, e])));
        this.rutina.set(rutina);
      },
      error: (e) => this.error.set(mensajeDeError(e)),
    });
  }

  nombreDe(ejercicioId: string): string {
    return this.catalogo().get(ejercicioId)?.nombre ?? 'Ejercicio';
  }

  resumen(r: Rutina): string {
    const series = r.ejercicios.reduce((n, e) => n + e.series.length, 0);
    return `${plural(r.ejercicios.length, 'ejercicio', 'ejercicios')}, ${plural(series, 'serie', 'series')}`;
  }

  usar(): void {
    const r = this.rutina();
    if (!r) return;
    this.errorAccion.set(null);
    this.trabajando.set(true);
    this.rutinas
      .usar(r.id)
      .pipe(finalize(() => this.trabajando.set(false)))
      .subscribe({
        next: (copia) => this.router.navigateByUrl(`/rutinas/${copia.id}`),
        error: (e) => this.errorAccion.set(mensajeDeError(e)),
      });
  }

  async confirmarEliminar(): Promise<void> {
    const r = this.rutina();
    if (!r) return;
    const alerta = await this.alertas.create({
      header: `¿Eliminar "${r.nombre}"?`,
      message: 'Las sesiones que ya registraste con esta rutina no se modifican.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => this.eliminar(r.id) },
      ],
    });
    await alerta.present();
  }

  private eliminar(id: string): void {
    this.errorAccion.set(null);
    this.trabajando.set(true);
    this.rutinas
      .eliminar(id)
      .pipe(finalize(() => this.trabajando.set(false)))
      .subscribe({
        next: () => this.router.navigateByUrl('/rutinas'),
        error: (e) => this.errorAccion.set(mensajeDeError(e)),
      });
  }
}