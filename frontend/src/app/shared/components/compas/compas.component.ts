import { Component, computed, input } from '@angular/core';
import { EstadoMarca } from '../../../core/utils/veredicto';

const MAX_MARCAS = 12;

const ORDEN: EstadoMarca[] = ['CUMPLIDA', 'SUPERADA', 'POR_DEBAJO', 'DISTINTA', 'EXTRA', 'SIN_HACER', 'PENDIENTE'];
const NOMBRES: Record<EstadoMarca, [string, string]> = {
  CUMPLIDA: ['cumplida', 'cumplidas'],
  SUPERADA: ['superada', 'superadas'],
  POR_DEBAJO: ['por debajo', 'por debajo'],
  DISTINTA: ['distinta', 'distintas'],
  EXTRA: ['extra', 'extras'],
  SIN_HACER: ['sin hacer', 'sin hacer'],
  PENDIENTE: ['pendiente', 'pendientes'],
};

@Component({
  selector: 'app-compas',
  template: `
    <span class="compas" role="img" [attr.aria-label]="etiqueta()">
      @for (m of marcas(); track $index) {
        <span class="marca" [attr.data-estado]="m"></span>
      }
    </span>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex-shrink: 0;
    }
    .compas {
      display: inline-flex;
      align-items: flex-end;
      gap: 3px;
      height: 20px;
    }
    .marca {
      width: 6px;
      height: 16px;
      border: 1.5px solid var(--tempo-tinta-suave);
      border-radius: 1.5px;
      box-sizing: border-box;
    }
    /* Pendiente: vacía, con el borde liso (es la marca base) */

    /* Cumplida: llena */
    .marca[data-estado='CUMPLIDA'] {
      background: var(--tempo-acento);
      border-color: var(--tempo-acento);
    }
    /* Superada: llena y más alta, sobresale del resto */
    .marca[data-estado='SUPERADA'] {
      height: 20px;
      background: var(--tempo-acento);
      border-color: var(--tempo-acento);
    }
    /* Por debajo: llena hasta la mitad, en ámbar */
    .marca[data-estado='POR_DEBAJO'] {
      border-color: var(--tempo-aviso);
      background: linear-gradient(to top, var(--tempo-aviso) 50%, transparent 50%);
    }
    /* Distinta: rayada */
    .marca[data-estado='DISTINTA'] {
      border-color: var(--tempo-acento);
      background: repeating-linear-gradient(135deg, var(--tempo-acento) 0 2px, transparent 2px 4px);
    }
    /* Extra: llena en gris, fuera del plan */
    .marca[data-estado='EXTRA'] {
      background: var(--tempo-tinta-suave);
    }
    /* Sin hacer: vacía con borde punteado */
    .marca[data-estado='SIN_HACER'] {
      border-style: dashed;
      opacity: 0.7;
    }
  `,
})
export class CompasComponent {
  total = input(0);
  hechas = input(0);
  estados = input<readonly EstadoMarca[] | null>(null);

  readonly marcas = computed<EstadoMarca[]>(() => {
    const estados = this.estados();
    if (estados) return estados.slice(0, MAX_MARCAS);
    return Array.from({ length: Math.min(this.total(), MAX_MARCAS) }, (_, i) =>
      i < this.hechas() ? 'CUMPLIDA' : 'PENDIENTE',
    );
  });

  readonly etiqueta = computed(() => {
    if (!this.estados()) {
      return this.hechas() > 0 ? `${this.hechas()} de ${this.total()} series` : `${this.total()} series`;
    }
    const cuenta = new Map<EstadoMarca, number>();
    for (const m of this.marcas()) cuenta.set(m, (cuenta.get(m) ?? 0) + 1);
    const partes = ORDEN.filter((e) => cuenta.get(e)).map((e) => {
      const n = cuenta.get(e)!;
      return `${n} ${NOMBRES[e][n === 1 ? 0 : 1]}`;
    });
    return `Series: ${partes.join(', ')}`;
  });
}