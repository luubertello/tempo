import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';import {
  AlertController,
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonDatetime,
  IonHeader,
  IonIcon,
  IonInput,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonToolbar,
  ModalController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  checkmarkCircle,
  chevronDownOutline,
  chevronUpOutline,
  closeOutline,
  ellipseOutline,
  trashOutline,
} from 'ionicons/icons';
import { finalize, forkJoin } from 'rxjs';
import { LIMITES } from '../../core/config/limites';
import { Ejercicio } from '../../core/models/ejercicio.model';
import { Rutina } from '../../core/models/rutina.model';
import { DatosSesionPasada } from '../../core/models/sesion.model';
import { EjerciciosService } from '../../core/services/ejercicios.service';
import { RutinasService } from '../../core/services/rutinas.service';
import { SesionesService } from '../../core/services/sesiones.service';
import { mensajeDeError } from '../../core/utils/errores';
import { etiquetaTipo, formatoFecha, isoHaceDias, valorDe } from '../../core/utils/formato';
import { armarSerieReal, Modo, modoDeTipo, SerieEscrita } from '../../core/utils/validaciones';
import { SelectorEjercicioComponent } from '../../shared/components/selector-ejercicio/selector-ejercicio.component';

interface SerieBorrador extends SerieEscrita {
  hecha: boolean;
}
interface EjercicioBorrador {
  ejercicioId: string;
  omitido: boolean;
  series: SerieBorrador[];
}

const texto = (n: number | null | undefined): string => (n === null || n === undefined ? '' : String(n));
const serieVacia = (): SerieBorrador => ({ hecha: true, repeticiones: '', carga: '', duracion: '' });

@Component({
  selector: 'app-sesion-pasada-form',
  templateUrl: './sesion-pasada-form.page.html',
  styleUrl: './sesion-pasada-form.page.scss',
  imports: [
    IonHeader, IonToolbar, IonButtons, IonBackButton, IonContent, IonInput, IonButton, IonIcon,
    IonSpinner, IonSelect, IonSelectOption, IonModal, IonDatetime,
  ],
})
export class SesionPasadaFormPage implements OnInit {
  private readonly sesiones = inject(SesionesService);
  private readonly rutinasApi = inject(RutinasService);
  private readonly catalogoApi = inject(EjerciciosService);
  private readonly router = inject(Router);
  private readonly modales = inject(ModalController);
  private readonly alertas = inject(AlertController);
  private readonly route = inject(ActivatedRoute);

  readonly hoy = isoHaceDias(0);
  readonly fecha = signal(this.fechaInicial());
  readonly rutinaId = signal('');
  readonly ejercicios = signal<EjercicioBorrador[]>([]);

  readonly rutinas = signal<Rutina[]>([]);
  readonly catalogo = signal<Map<string, Ejercicio>>(new Map());
  readonly listo = signal(false);
  readonly errorCarga = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly guardando = signal(false);
  readonly cambiandoFecha = signal(false);

  readonly formatoFecha = formatoFecha;
  readonly valorDe = valorDe;

  constructor() {
    addIcons({ chevronUpOutline, chevronDownOutline, trashOutline, closeOutline, checkmarkCircle, ellipseOutline });
  }

  ngOnInit(): void {
    forkJoin({ catalogo: this.catalogoApi.listar(), rutinas: this.rutinasApi.listarPropias() }).subscribe({
      next: ({ catalogo, rutinas }) => {
        this.catalogo.set(new Map(catalogo.map((e) => [e.id, e])));
        this.rutinas.set(rutinas);
        this.listo.set(true);
      },
      error: (e) => this.errorCarga.set(mensajeDeError(e)),
    });
  }
  
  private fechaInicial(): string {
    const f = this.route.snapshot.queryParamMap.get('fecha');
    return f && /^\d{4}-\d{2}-\d{2}$/.test(f) && f <= this.hoy ? f : isoHaceDias(1);
  }

  // ---- catálogo ----

  nombreDe(ejercicioId: string): string {
    return this.catalogo().get(ejercicioId)?.nombre ?? 'Ejercicio';
  }

  etiquetaDe(ejercicioId: string): string {
    const tipo = this.catalogo().get(ejercicioId)?.tipoMedicion;
    return tipo ? etiquetaTipo(tipo) : '';
  }

  modoDe(ejercicioId: string): Modo {
    return modoDeTipo(this.catalogo().get(ejercicioId)?.tipoMedicion);
  }

  // ---- fecha y rutina ----

  elegirFecha(ev: Event): void {
    const f = String((ev as CustomEvent).detail.value ?? '').slice(0, 10);
    this.cambiandoFecha.set(false);
    if (f) this.fecha.set(f);
  }

  async elegirRutina(ev: Event): Promise<void> {
    const id = valorDe(ev);
    if (id === this.rutinaId()) return;

    if (this.ejercicios().length > 0 && !(await this.confirmarReemplazo())) {
      (ev.target as HTMLIonSelectElement).value = this.rutinaId();
      return;
    }
    this.rutinaId.set(id);
    this.error.set(null);
    const rutina = this.rutinas().find((r) => r.id === id);
    this.ejercicios.set(rutina ? this.desdeRutina(rutina) : []);
  }

  private async confirmarReemplazo(): Promise<boolean> {
    const alerta = await this.alertas.create({
      header: '¿Reemplazar lo que cargaste?',
      message: 'Los ejercicios y series que escribiste se reemplazan por los de la rutina.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Reemplazar', role: 'confirm' },
      ],
    });
    await alerta.present();
    const { role } = await alerta.onDidDismiss();
    return role === 'confirm';
  }

  private desdeRutina(r: Rutina): EjercicioBorrador[] {
    return r.ejercicios.map((e) => ({
      ejercicioId: e.ejercicioId,
      omitido: false,
      series: e.series.map((s) => ({
        hecha: true,
        repeticiones: texto(s.repeticiones),
        carga: texto(s.carga),
        duracion: texto(s.duracionSegundos),
      })),
    }));
  }

  // ---- edición del borrador ----

  async elegirEjercicio(): Promise<void> {
    this.error.set(null);
    if (this.ejercicios().length >= LIMITES.EJERCICIOS_POR_RUTINA) {
      this.error.set(`Un entrenamiento admite hasta ${LIMITES.EJERCICIOS_POR_RUTINA} ejercicios.`);
      return;
    }
    const modal = await this.modales.create({
      component: SelectorEjercicioComponent,
      initialBreakpoint: 0.8,
      breakpoints: [0, 0.8, 1],
    });
    await modal.present();
    const { data, role } = await modal.onDidDismiss<Ejercicio>();
    if (role !== 'elegido' || !data) return;
    this.ejercicios.update((l) => [...l, { ejercicioId: data.id, omitido: false, series: [serieVacia()] }]);
  }

  quitarEjercicio(i: number): void {
    this.ejercicios.update((l) => l.filter((_, k) => k !== i));
  }

  mover(i: number, delta: -1 | 1): void {
    const j = i + delta;
    this.ejercicios.update((l) => {
      if (j < 0 || j >= l.length) return l;
      const copia = [...l];
      [copia[i], copia[j]] = [copia[j], copia[i]];
      return copia;
    });
  }

  alternarOmitido(i: number): void {
    this.actualizar(i, (e) => ({ ...e, omitido: !e.omitido }));
  }

  agregarSerie(i: number): void {
    const actual = this.ejercicios()[i];
    if (actual.series.length >= LIMITES.SERIES_POR_EJERCICIO) {
      this.error.set(`Un ejercicio admite hasta ${LIMITES.SERIES_POR_EJERCICIO} series.`);
      return;
    }
    this.error.set(null);
    this.actualizar(i, (e) => ({ ...e, series: [...e.series, { ...e.series[e.series.length - 1], hecha: true }] }));
  }

  quitarSerie(i: number, j: number): void {
    this.actualizar(i, (e) => ({ ...e, series: e.series.filter((_, k) => k !== j) }));
  }

  alternarHecha(i: number, j: number): void {
    this.actualizar(i, (e) => ({
      ...e,
      series: e.series.map((s, k) => (k === j ? { ...s, hecha: !s.hecha } : s)),
    }));
  }

  cambiar(i: number, j: number, campo: keyof SerieEscrita, ev: Event): void {
    const valor = valorDe(ev);
    this.actualizar(i, (e) => ({
      ...e,
      series: e.series.map((s, k) => (k === j ? { ...s, [campo]: valor } : s)),
    }));
  }

  private actualizar(i: number, cambio: (e: EjercicioBorrador) => EjercicioBorrador): void {
    this.ejercicios.update((l) => l.map((e, k) => (k === i ? cambio(e) : e)));
  }

  // ---- guardar ----

  guardar(): void {
    const { datos, aviso } = this.construir();
    if (!datos) {
      this.error.set(aviso ?? 'Revisá los datos del entrenamiento.');
      return;
    }
    this.error.set(null);
    this.guardando.set(true);
    this.sesiones
      .registrarPasada(datos)
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: (s) => this.router.navigateByUrl(`/historial/${s.id}`, { replaceUrl: true }),
        error: (e) => this.error.set(mensajeDeError(e)),
      });
  }

  private construir(): { datos?: DatosSesionPasada; aviso?: string } {
    const lista = this.ejercicios();
    if (lista.length === 0) return { aviso: 'Agregá al menos un ejercicio.' };

    let hechas = 0;
    const ejercicios: DatosSesionPasada['ejercicios'] = [];

    for (const e of lista) {
      const modo = this.modoDe(e.ejercicioId);
      const series: DatosSesionPasada['ejercicios'][number]['series'] = [];

      for (const [j, s] of e.series.entries()) {
        if (e.omitido || !s.hecha) {
          series.push({ completada: false });
          continue;
        }
        const { datos, aviso } = armarSerieReal(modo, s);
        if (!datos) return { aviso: `${this.nombreDe(e.ejercicioId)}, serie ${j + 1}: ${aviso}` };
        series.push({ completada: true, ...datos });
        hechas++;
      }
      ejercicios.push({ ejercicioId: e.ejercicioId, omitido: e.omitido, series });
    }

    if (hechas === 0) {
      return { aviso: 'Marcá al menos una serie como hecha. Un entrenamiento finalizado necesita al menos una.' };
    }
    return { datos: { fecha: this.fecha(), rutinaId: this.rutinaId() || undefined, ejercicios } };
  }
}