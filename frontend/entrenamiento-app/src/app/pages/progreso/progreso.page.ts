import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonSpinner } from '@ionic/angular';
import { finalize } from 'rxjs';
import { ResumenEjercicio } from '../../core/models/estadistica.model';
import { EstadisticasService } from '../../core/services/estadisticas.service';
import { mensajeDeError } from '../../core/utils/errores';
import { formatoValor, plural } from '../../core/utils/formato';

@Component({
  selector: 'app-progreso',
  templateUrl: './progreso.page.html',
  styleUrl: './progreso.page.scss',
  imports: [IonContent, IonSpinner, IonButton, RouterLink],
})
export class ProgresoPage {
  private readonly api = inject(EstadisticasService);

  readonly resumen = signal<ResumenEjercicio[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  readonly formatoValor = formatoValor;

  // Ionic conserva las pantallas de las pestañas: se vuelve a cargar cada vez que se entra.
  ionViewWillEnter(): void {
    this.cargar();
  }

  cargar(): void {
    this.error.set(null);
    this.cargando.set(true);
    this.api
      .resumen()
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (lista) => this.resumen.set(lista),
        error: (e) => this.error.set(mensajeDeError(e)),
      });
  }

  veces(r: ResumenEjercicio): string {
    return plural(r.vecesRealizado, 'entrenamiento', 'entrenamientos');
  }
}