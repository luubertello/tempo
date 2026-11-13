import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  AlertController,
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonDatetime,
  IonHeader,
  IonInput,
  IonModal,
  IonSpinner,
  IonToolbar,
} from '@ionic/angular';
import { finalize, forkJoin, Observable, switchMap } from 'rxjs';
import { Ejercicio } from '../../core/models/ejercicio.model';
import { EjercicioDeSesion, SerieDeSesion, Sesion } from '../../core/models/sesion.model';
import { EjerciciosService } from '../../core/services/ejercicios.service';
import { SesionesService } from '../../core/services/sesiones.service';
import { mensajeDeError } from '../../core/utils/errores';
import { formatoFecha, plural, textoSerie, valorDe } from '../../core/utils/formato';
import { difiereDelObjetivo, etiquetaResultado, seriesHechas } from '../../core/utils/sesion';
import { armarSerieReal, Modo, modoDeTipo, SerieEscrita } from '../../core/utils/validaciones';
import { CompasComponent } from '../../shared/components/compas/compas.component';

interface Edicion {
  ejercicio: number;
  serie: number;
}

const texto = (n: number | null | undefined): string => (n === null || n === undefined ? '' : String(n));

@Component({
  selector: 'app-historial-detalle',
  templateUrl: './historial-detalle.page.html',
  styleUrl: './historial-detalle.page.scss',
  imports: [
    IonHeader, IonToolbar, IonButtons, IonBackButton, IonContent, IonButton, IonInput,
    IonSpinner, IonModal, IonDatetime, RouterLink, CompasComponent,
  ],
})
export class HistorialDetallePage {
  private readonly sesiones = inject(SesionesService);
  private readonly ejerciciosApi = inject(EjerciciosService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly alertas = inject(AlertController);

  readonly sesion = signal<Sesion | null>(null);
  readonly catalogo = signal<Map<string, Ejercicio>>(new Map());
  readonly error = signal<string | null>(null);
  readonly errorAccion = signal<string | null>(null);
  readonly errorEdicion = signal<string | null>(null);
  readonly trabajando = signal(false);

  readonly edicion = signal<Edicion | null>(null);
  readonly borrador = signal<SerieEscrita>({ repeticiones: '', carga: '', duracion: '' });
  readonly cambiandoFecha = signal(false);

  readonly editable = computed(() => this.sesion()?.estado === 'FINALIZADA');
  readonly titulo = computed(() => this.sesion()?.nombreRutina ?? 'Entrenamiento libre');
  readonly resumen = computed(() => {
    const s = this.sesion();
    if (!s) return '';
    const hechas = s.ejercicios.reduce((n, e) => n + seriesHechas(e), 0);
    return `${plural(s.ejercicios.length, 'ejercicio', 'ejercicios')}, ${plural(hechas, 'serie completada', 'series completadas')}`;
  });

  readonly hoy = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  readonly formatoFecha = formatoFecha;
  readonly textoSerie = textoSerie;
  readonly valorDe = valorDe;
  readonly seriesHechas = seriesHechas;
  readonly difiere = difiereDelObjetivo;
  readonly etiquetaResultado = etiquetaResultado;

  ionViewWillEnter(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.error.set(null);
    this.edicion.set(null);
    forkJoin({ sesion: this.sesiones.ver(id), catalogo: this.ejerciciosApi.listar() }).subscribe({
      next: ({ sesion, catalogo }) => {
        this.catalogo.set(new Map(catalogo.map((e) => [e.id, e])));
        this.sesion.set(sesion);
      },
      error: (e) => this.error.set(mensajeDeError(e)),
    });
  }

  nombreDe(ejercicioId: string): string {
    return this.catalogo().get(ejercicioId)?.nombre ?? 'Ejercicio';
  }

  modoDe(ejercicioId: string): Modo {
    return modoDeTipo(this.catalogo().get(ejercicioId)?.tipoMedicion);
  }

  esEdicion(e: EjercicioDeSesion, s: SerieDeSesion): boolean {
    const ed = this.edicion();
    return ed?.ejercicio === e.orden && ed?.serie === s.orden;
  }

  // ---- corregir una serie ----

  editar(e: EjercicioDeSesion, s: SerieDeSesion): void {
    this.errorEdicion.set(null);
    this.errorAccion.set(null);
    const base = s.completada ? s : (s.objetivo ?? s);
    this.borrador.set({
      repeticiones: texto(base.repeticiones),
      carga: texto(base.carga),
      duracion: texto(base.duracionSegundos),
    });
    this.edicion.set({ ejercicio: e.orden, serie: s.orden });
  }

  cancelarEdicion(): void {
    this.edicion.set(null);
    this.errorEdicion.set(null);
  }

  cambiar(campo: keyof SerieEscrita, ev: Event): void {
    const valor = valorDe(ev);
    this.borrador.update((b) => ({ ...b, [campo]: valor }));
  }

  guardarEdicion(e: EjercicioDeSesion, s: SerieDeSesion): void {
    const { datos, aviso } = armarSerieReal(this.modoDe(e.ejercicioId), this.borrador());
    if (!datos) {
      this.errorEdicion.set(aviso ?? 'Revisá los datos de la serie.');
      return;
    }
    this.ejecutar(this.sesiones.corregirSerie(this.sesion()!.id, e.orden, s.orden, { datos }), (m) =>
      this.errorEdicion.set(m),
    );
  }

  marcarNoHecha(e: EjercicioDeSesion, s: SerieDeSesion): void {
    this.ejecutar(this.sesiones.corregirSerie(this.sesion()!.id, e.orden, s.orden, { completada: false }), (m) =>
      this.errorEdicion.set(m),
    );
  }

  quitarSerie(e: EjercicioDeSesion, s: SerieDeSesion): void {
    this.ejecutar(this.sesiones.quitarSerie(this.sesion()!.id, e.orden, s.orden), (m) => this.errorEdicion.set(m));
  }

  // ---- corregir el entrenamiento ----

  async confirmarQuitarEjercicio(e: EjercicioDeSesion): Promise<void> {
    const alerta = await this.alertas.create({
      header: `¿Quitar "${this.nombreDe(e.ejercicioId)}"?`,
      message: 'Se borran todas sus series de este entrenamiento.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Quitar ejercicio',
          role: 'destructive',
          handler: () =>
            this.ejecutar(this.sesiones.quitarEjercicio(this.sesion()!.id, e.orden), (m) => this.errorAccion.set(m)),
        },
      ],
    });
    await alerta.present();
  }

  elegirFecha(ev: Event): void {
    const fecha = String((ev as CustomEvent).detail.value ?? '').slice(0, 10);
    this.cambiandoFecha.set(false);
    if (!fecha || fecha === this.sesion()?.fechaSesion) return;
    this.ejecutar(this.sesiones.cambiarFecha(this.sesion()!.id, fecha), (m) => this.errorAccion.set(m));
  }

  async confirmarEliminar(): Promise<void> {
    const alerta = await this.alertas.create({
      header: '¿Eliminar este entrenamiento?',
      message: 'No se puede deshacer. Tus estadísticas se recalculan sin él.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => this.eliminar() },
      ],
    });
    await alerta.present();
  }

  private eliminar(): void {
    this.errorAccion.set(null);
    this.trabajando.set(true);
    this.sesiones
      .eliminar(this.sesion()!.id)
      .pipe(finalize(() => this.trabajando.set(false)))
      .subscribe({
        next: () => this.router.navigateByUrl('/historial', { replaceUrl: true }),
        error: (e) => this.errorAccion.set(mensajeDeError(e)),
      });
  }

  private ejecutar(peticion: Observable<unknown>, alFallar: (mensaje: string) => void): void {
    const id = this.sesion()!.id;
    this.errorAccion.set(null);
    this.errorEdicion.set(null);
    this.trabajando.set(true);
    peticion
      .pipe(
        switchMap(() => this.sesiones.ver(id)),
        finalize(() => this.trabajando.set(false)),
      )
      .subscribe({
        next: (nueva) => {
          this.sesion.set(nueva);
          this.edicion.set(null);
        },
        error: (e) => alFallar(mensajeDeError(e)),
      });
  }
}