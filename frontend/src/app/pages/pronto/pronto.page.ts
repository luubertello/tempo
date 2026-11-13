import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonButton, IonContent } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-pronto',
  imports: [IonContent, IonButton],
  template: `
    <ion-content [fullscreen]="true">
      <main class="pronto">
        <h1>{{ titulo }}</h1>
        <p>Esta pantalla se arma en el próximo paso.</p>
        <ion-button fill="clear" (click)="auth.salir()">Cerrar sesión</ion-button>
      </main>
    </ion-content>
  `,
  styles: `
    .pronto {
      max-width: 26rem;
      margin: 0 auto;
      padding: 3rem 1.5rem;
    }
    h1 {
      margin: 0 0 0.5rem;
      font-size: 2.25rem;
      font-weight: 700;
    }
    p {
      margin: 0 0 1.5rem;
      color: var(--tempo-tinta-suave);
    }
    ion-button {
      --color: var(--tempo-acento);
      margin-left: -0.75rem;
    }
  `,
})
export class ProntoPage {
  readonly auth = inject(AuthService);
  readonly titulo = inject(ActivatedRoute).snapshot.data['titulo'] as string;
}