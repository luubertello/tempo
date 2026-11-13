import { Component, computed, input } from '@angular/core';
import { PuntoEvolucion, Unidad } from '../../../core/models/estadistica.model';
import { fechaCorta, formatoValor } from '../../../core/utils/formato';

const MAX_BARRAS = 60;

@Component({
  selector: 'app-grafico-evolucion',
  template: `
    <figure class="grafico" role="img" [attr.aria-label]="descripcion()">
      <div class="barras">
        @for (b of barras(); track b.fecha) {
          <div class="col">
            <span class="barra" [class.max]="b.esMax" [style.height.%]="b.alto">
              @if (b.etiqueta) {
                <span class="valor">{{ formato(b.valor) }}</span>
              }
            </span>
          </div>
        }
      </div>
      <figcaption class="ejes">
        <span>{{ primera() }}</span>
        @if (barras().length > 1) {
          <span>{{ ultima() }}</span>
        }
      </figcaption>
    </figure>
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
      padding-top: 1.75rem;
      border-bottom: 1px solid var(--tempo-linea);
    }
    .col {
      flex: 1;
      max-width: 1.75rem;
      height: 100%;
      display: flex;
      align-items: flex-end;
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
      color: var(--tempo-tinta-suave);
      font-size: 0.8rem;
      font-variant-numeric: tabular-nums;
    }
  `,
})
export class GraficoEvolucionComponent {
  puntos = input.required<PuntoEvolucion[]>();
  unidad = input.required<Unidad>();

  private readonly visibles = computed(() => this.puntos().slice(-MAX_BARRAS));

  readonly barras = computed(() => {
    const lista = this.visibles();
    const max = Math.max(0, ...lista.map((p) => p.valor));
    let marcada = false;
    return lista.map((p) => {
      const esMax = max > 0 && p.valor === max;
      const etiqueta = esMax && !marcada; 
      return {
        fecha: p.fechaSesion,
        valor: p.valor,
        alto: max > 0 ? Math.max(4, (p.valor / max) * 100) : 4,
        esMax,
        etiqueta,
      };
    });
  });

  readonly primera = computed(() => fechaCorta(this.visibles()[0]?.fechaSesion ?? ''));
  readonly ultima = computed(() => fechaCorta(this.visibles().at(-1)?.fechaSesion ?? ''));

  readonly descripcion = computed(() => {
    const l = this.visibles();
    if (l.length === 0) return 'Sin registros';
    const mejor = Math.max(...l.map((p) => p.valor));
    return `Evolución en ${l.length} días, del ${this.primera()} al ${this.ultima()}. Mejor marca: ${this.formato(mejor)}.`;
  });

  formato(valor: number): string {
    return formatoValor(valor, this.unidad());
  }
}