import { Component } from '@angular/core';
import { IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { barbellOutline, listOutline, statsChartOutline, timeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="entrenar">
          <ion-icon name="barbell-outline" />
          <ion-label>Entrenar</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="rutinas">
          <ion-icon name="list-outline" />
          <ion-label>Rutinas</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="historial">
          <ion-icon name="time-outline" />
          <ion-label>Historial</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="progreso">
          <ion-icon name="stats-chart-outline" />
          <ion-label>Progreso</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
})
export class TabsPage {
  constructor() {
    addIcons({ barbellOutline, listOutline, timeOutline, statsChartOutline });
  }
}