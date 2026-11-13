import { Component, computed, inject, signal } from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonSearchbar,
  IonSpinner,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular';
import { finalize } from 'rxjs';
import { Ejercicio } from '../../../core/models/ejercicio.model';
import { EjerciciosService } from '../../../core/services/ejercicios.service';
import { mensajeDeError } from '../../../core/utils/errores';
import { etiquetaTipo, normalizar, valorDe } from '../../../core/utils/formato';

@Component({
  selector: 'app-selector-ejercicio',
  templateUrl: './selector-ejercicio.component.html',
  styleUrl: './selector-ejercicio.component.scss',
  imports: [IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonSearchbar, IonSpinner],
})
export class SelectorEjercicioComponent {
  private readonly modal = inject(ModalController);
  private readonly api = inject(EjerciciosService);

  readonly ejercicios = signal<Ejercicio[]>([]);
  readonly busqueda = signal('');
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly etiquetaTipo = etiquetaTipo;

  readonly filtrados = computed(() => {
    const q = normalizar(this.busqueda());
    return q ? this.ejercicios().filter((e) => normalizar(e.nombre).includes(q)) : this.ejercicios();
  });

  constructor() {
    this.api
      .listar()
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (lista) => this.ejercicios.set(lista),
        error: (e) => this.error.set(mensajeDeError(e)),
      });
  }

  buscar(ev: Event): void {
    this.busqueda.set(valorDe(ev));
  }

  elegir(ejercicio: Ejercicio): void {
    this.modal.dismiss(ejercicio, 'elegido');
  }

  cerrar(): void {
    this.modal.dismiss(null, 'cancel');
  }
}