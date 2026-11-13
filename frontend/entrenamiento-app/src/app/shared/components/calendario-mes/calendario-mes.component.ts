import { Component, computed, input, output, signal } from '@angular/core';
import { IonButton, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import { plural } from '../../../core/utils/formato';

interface Celda {
  iso: string;
  dia: number;
  entrenado: boolean;
  hoy: boolean;
  futuro: boolean;
  etiqueta: string;
}

const pad = (n: number): string => String(n).padStart(2, '0');

@Component({
  selector: 'app-calendario-mes',
  templateUrl: './calendario-mes.component.html',
  styleUrl: './calendario-mes.component.scss',
  imports: [IonButton, IonIcon],
})
export class CalendarioMesComponent {
  entrenados = input.required<ReadonlySet<string>>(); 
  hoy = input.required<string>();
  seleccionado = input<string | null>(null);
  elegir = output<string>();

  readonly letras = ['L', 'M', 'M', 'J', 'V', 'S', 'D']; 
  private readonly desplazamiento = signal(0); 
  readonly esMesActual = computed(() => this.desplazamiento() === 0);

  private readonly primerDia = computed(() => {
    const [a, m] = this.hoy().split('-').map(Number);
    return new Date(a, m - 1 + this.desplazamiento(), 1);
  });

  readonly nombreMes = computed(() => this.primerDia().toLocaleDateString('es-AR', { month: 'long' }));
  readonly titulo = computed(() => {
    const t = this.primerDia().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
    return t.charAt(0).toUpperCase() + t.slice(1);
  });

  readonly celdas = computed<(Celda | null)[]>(() => {
    const p = this.primerDia();
    const a = p.getFullYear();
    const m = p.getMonth();
    const vacias = (p.getDay() + 6) % 7; 
    const total = new Date(a, m + 1, 0).getDate();
    const celdas: (Celda | null)[] = Array.from({ length: vacias }, () => null);

    for (let d = 1; d <= total; d++) {
      const iso = `${a}-${pad(m + 1)}-${pad(d)}`;
      const entrenado = this.entrenados().has(iso);
      celdas.push({
        iso,
        dia: d,
        entrenado,
        hoy: iso === this.hoy(),
        futuro: iso > this.hoy(),
        etiqueta: `${d} de ${this.nombreMes()}${entrenado ? ', entrenaste' : ''}`,
      });
    }
    return celdas;
  });

  readonly resumen = computed(() => {
    const dias = this.celdas().filter((c) => c?.entrenado).length;
    return dias === 0
      ? `Sin entrenamientos en ${this.nombreMes()}.`
      : `${plural(dias, 'día entrenado', 'días entrenados')} en ${this.nombreMes()}.`;
  });

  constructor() {
    addIcons({ chevronBackOutline, chevronForwardOutline });
  }

  mover(delta: -1 | 1): void {
    if (delta > 0 && this.esMesActual()) return; 
    this.desplazamiento.update((d) => d + delta);
  }
}