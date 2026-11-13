import { Component, input } from '@angular/core';

@Component({
  selector: 'app-marca',
  templateUrl: './marca.component.html',
  styleUrl: './marca.component.scss',
})
export class MarcaComponent {
  grande = input(false);
  animado = input(false);
  readonly marcas = [0, 1, 2, 3, 4];
  readonly hechas = 3;
}