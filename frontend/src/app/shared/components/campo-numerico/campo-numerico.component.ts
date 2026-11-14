import { Component, computed, input, model } from '@angular/core';

let siguienteId = 0;

@Component({
  selector: 'app-campo-numerico',
  templateUrl: './campo-numerico.component.html',
  styleUrl: './campo-numerico.component.scss',
})
export class CampoNumericoComponent {
  etiqueta = input.required<string>();
  unidad = input('');
  paso = input(1);
  minimo = input(1);
  maximo = input(1000);
  decimales = input(false);
  deshabilitado = input(false);
  valor = model('');
  error = input<string | null>(null);

  readonly id = `campo-numerico-${siguienteId++}`;

  readonly textoPaso = computed(() => `${this.paso().toLocaleString('es-AR')} ${this.unidad()}`.trim());
  readonly nombreAccesible = computed(() => (this.unidad() ? `${this.etiqueta()} en ${this.unidad()}` : this.etiqueta()));

  cambiar(direccion: -1 | 1): void {
    const actual = this.numero();
    let siguiente: number;
    if (actual === null) {
      if (direccion < 0) return;
      siguiente = Math.max(this.paso(), this.minimo());
    } else {
      siguiente = actual + direccion * this.paso();
    }
    siguiente = Math.round(Math.min(this.maximo(), Math.max(this.minimo(), siguiente)) * 100) / 100;
    this.valor.set(String(siguiente).replace('.', ','));
  }

  escribir(ev: Event): void {
    const el = ev.target as HTMLInputElement;
    let t = el.value.replace(/[^\d.,]/g, '');
    if (!this.decimales()) {
      t = t.replace(/[.,]/g, '');
    } else {
      const i = t.search(/[.,]/);
      if (i >= 0) t = t.slice(0, i + 1) + t.slice(i + 1).replace(/[.,]/g, '').slice(0, 2);
    }
    if (t !== el.value) el.value = t;
    this.valor.set(t);
  }

  seleccionar(ev: Event): void {
    (ev.target as HTMLInputElement).select();
  }

  private numero(): number | null {
    const t = this.valor().trim().replace(',', '.');
    if (t === '') return null;
    const n = Number(t);
    return Number.isFinite(n) ? n : null;
  }
}