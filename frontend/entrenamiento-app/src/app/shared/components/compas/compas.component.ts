import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-compas',
  template: `
    <span class="compas" role="img" [attr.aria-label]="etiqueta()">
      @for (m of marcas(); track $index) {
        <span class="marca" [class.hecha]="$index < hechas()"></span>
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
      height: 16px;
    }
    .marca {
      width: 5px;
      height: 100%;
      border: 1.5px solid var(--tempo-tinta-suave);
      border-radius: 1.5px;
      box-sizing: border-box;
    }
    .marca.hecha {
      background: var(--tempo-acento);
      border-color: var(--tempo-acento);
    }
  `,
})
export class CompasComponent {
  total = input.required<number>();
  hechas = input(0);

  readonly marcas = computed(() => Array.from({ length: Math.min(this.total(), 12) }));
  readonly etiqueta = computed(() =>
    this.hechas() > 0 ? `${this.hechas()} de ${this.total()} series` : `${this.total()} series`,
  );
}