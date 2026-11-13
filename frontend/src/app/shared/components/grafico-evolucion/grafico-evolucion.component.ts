import { Component, computed, input, signal } from '@angular/core';
import { PuntoEvolucion, Unidad } from '../../../core/models/estadistica.model';
import { fechaCorta, formatoFecha, formatoValor } from '../../../core/utils/formato';

const MAX_BARRAS = 60;

@Component({
  selector: 'app-grafico-evolucion',
  template: `
    <figure class="grafico">
      <div class="barras">
        @for (b of barras(); track b.fecha) {
          <button
            type="button"
            class="col"
            [attr.aria-label]="b.descripcion"
            [attr.aria-pressed]="b.fecha === elegida()"
            (click)="elegir(b.fecha)"
          >
            <span class="barra" [class.max]="b.esMax" [class.elegida]="b.fecha === elegida()" [style.height.%]="b.alto">
              @if (b.etiqueta) {
                <span class="valor">{{ formato(b.valor) }}</span>
              }
            </span>
          </button>
        }
      </div>
      <figcaption class="ejes">
        <span>{{ primera() }}</span>
        @if (barras().length > 1) {
          <span>{{ ultima() }}</span>
        }
      </figcaption>
    </figure>

    <p class="detalle-barra" aria-live="polite">
      @if (detalle(); as d) {
        <span class="dia">{{ d.dia }}</span>
        <span class="marca">
          {{ d.marca }}
          @if (d.esMax) {
            <span class="mejor">Mejor marca</span>
          }
        </span>
      } @else {
        <span class="ayuda">Tocá una barra para ver el día y la marca.</span>
      }
    </p>
  `,
  styles: `
    :host {
      display: block;
    }
    .grafico {
      margin: 0;
    }
    .barras {
      display: flex;
      align-items: flex-end;
      justify-content: center;
      gap: 4px;
      height: 11rem;
      padding: 1.75rem 1.5rem 0;
      border-bottom: 1px solid var(--tempo-linea);
    }
    .col {
      flex: 1;
      max-width: 1.75rem;
      height: 100%;
      display: flex;
      align-items: flex-end;
      padding: 0;
      border: 0;
      background: none;
      font: inherit;
      cursor: pointer;
    }
    .barra {
      position: relative;
      width: 100%;
      border-radius: 3px 3px 0 0;
      background: color-mix(in srgb, var(--tempo-acento) 32%, transparent);
    }
    .barra.max {
      background: var(--tempo-acento);
    }
    .barra.elegida {
      outline: 2px solid var(--tempo-tinta);
      outline-offset: 1px;
    }
    .valor {
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translate(-50%, -0.3rem);
      white-space: nowrap;
      font-family: var(--tempo-fuente-titulo);
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--tempo-tinta);
    }
    .ejes {
      display: flex;
      justify-content: space-between;
      margin-top: 0.4rem;
      padding: 0 1.5rem;
      color: var(--tempo-tinta-suave);
      font-size: 0.8rem;
      font-variant-numeric: tabular-nums;
    }
    .detalle-barra {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 1rem;
      min-height: 1.75rem;
      margin: 1rem 0 0;
    }
    .dia {
      color: var(--tempo-tinta-suave);
    }
    .marca {
      font-family: var(--tempo-fuente-titulo);
      font-size: 1.15rem;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
    }
    .mejor {
      margin-left: 0.5rem;
      color: var(--tempo-acento);
      font-family: var(--tempo-fuente);
      font-size: 0.85rem;
      font-weight: 600;
    }
    .ayuda {
      color: var(--tempo-tinta-suave);
      font-size: 0.9rem;
    }
  `,
})
export class GraficoEvolucionComponent {
  puntos = input.required<PuntoEvolucion[]>();
  unidad = input.required<Unidad>();

  private readonly _elegida = signal<string | null>(null);

  private readonly visibles = computed(() => this.puntos().slice(-MAX_BARRAS));

  readonly maximo = computed(() => Math.max(0, ...this.visibles().map((p) => p.valor)));

  readonly barras = computed(() => {
    const lista = this.visibles();
    const max = this.maximo();
    const indiceEtiqueta = max > 0 ? lista.map((p) => p.valor).lastIndexOf(max) : -1;
    return lista.map((p, i) => ({
      fecha: p.fechaSesion,
      valor: p.valor,
      alto: max > 0 ? Math.max(4, (p.valor / max) * 100) : 4,
      esMax: max > 0 && p.valor === max,
      etiqueta: i === indiceEtiqueta,
      descripcion: `${formatoFecha(p.fechaSesion)}: ${this.formato(p.valor)}`,
    }));
  });

  readonly elegida = computed(() => {
    const f = this._elegida();
    return f !== null && this.visibles().some((p) => p.fechaSesion === f) ? f : null;
  });

  readonly detalle = computed(() => {
    const f = this.elegida();
    const p = this.visibles().find((x) => x.fechaSesion === f);
    if (!p) return null;
    return {
      dia: formatoFecha(p.fechaSesion),
      marca: this.formato(p.valor),
      esMax: p.valor === this.maximo(),
    };
  });

  readonly primera = computed(() => fechaCorta(this.visibles()[0]?.fechaSesion ?? ''));
  readonly ultima = computed(() => fechaCorta(this.visibles().at(-1)?.fechaSesion ?? ''));

  elegir(fecha: string): void {
    this._elegida.set(this._elegida() === fecha ? null : fecha);
  }

  formato(valor: number): string {
    return formatoValor(valor, this.unidad());
  }
}