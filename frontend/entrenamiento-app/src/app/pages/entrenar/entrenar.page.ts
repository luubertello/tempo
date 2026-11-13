import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AlertController, IonButton, IonContent, IonInput, IonSpinner, ModalController } from '@ionic/angular';
import { finalize, forkJoin, switchMap } from 'rxjs';
import { LIMITES } from '../../core/config/limites';
import { Ejercicio } from '../../core/models/ejercicio.model';
import { DatosSerie, Rutina } from '../../core/models/rutina.model';
import { EjercicioDeSesion, SerieDeSesion, Sesion } from '../../core/models/sesion.model';
import { EjerciciosService } from '../../core/services/ejercicios.service';
import { RutinasService } from '../../core/services/rutinas.service';
import { SesionesService } from '../../core/services/sesiones.service';
import { mensajeDeError } from '../../core/utils/errores';
import { formatoFecha, plural, textoSerie, valorDe } from '../../core/utils/formato';
import { armarSerieReal, Modo, modoDeTipo, SerieEscrita } from '../../core/utils/validaciones';
import { CompasComponent } from '../../shared/components/compas/compas.component';
import { SelectorEjercicioComponent } from '../../shared/components/selector-ejercicio/selector-ejercicio.component';

interface Fila {
  tipo: 'hecha' | 'pendiente' | 'entrada';
  orden: number;
  serie: SerieDeSesion | null;
}

const texto = (n: number | null | undefined): string => (n === null || n === undefined ? '' : String(n));

@Component({
  selector: 'app-entrenar',
  templateUrl: './entrenar.page.html',
  styleUrl: './entrenar.page.scss',
  imports: [IonContent, IonInput, IonButton, IonSpinner, RouterLink, CompasComponent],
})
export class EntrenarPage {
  private readonly sesiones = inject(SesionesService);
  private readonly rutinasApi = inject(RutinasService);
  private readonly catalogoApi = inject(EjerciciosService);
  private readonly modales = inject(ModalController);
  private readonly alertas = inject(AlertController);

  readonly sesion = signal<Sesion | null>(null);
  readonly rutinas = signal<Rutina[]>([]);
  readonly catalogo = signal<Map<string, Ejercicio>>(new Map());
  readonly borradores = signal<Record<number, SerieEscrita>>({});

  readonly cargando = signal(true);
  readonly errorCarga = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly errorSerie = signal<{ orden: number; mensaje: string } | null>(null);
  readonly trabajando = signal(false);
  readonly registrando = signal<number | null>(null);
  readonly iniciando = signal<string | null>(null);
  readonly terminado = signal<string | null>(null);

  readonly titulo = computed(() => this.sesion()?.nombreRutina ?? 'Entrenamiento libre');
  readonly fecha = computed(() => {
    const s = this.sesion();
    return s ? formatoFecha(s.fechaSesion) : '';
  });

  readonly textoSerie = textoSerie;
  readonly valorDe = valorDe;

  ionViewWillEnter(): void {
    this.cargar();
  }

  cargar(): void {
    this.errorCarga.set(null);
    this.cargando.set(true);
    forkJoin({
      sesion: this.sesiones.enCurso(),
      catalogo: this.catalogoApi.listar(),
      rutinas: this.rutinasApi.listarPropias(),
    })
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: ({ sesion, catalogo, rutinas }) => {
          this.catalogo.set(new Map(catalogo.map((e) => [e.id, e])));
          this.rutinas.set(rutinas);
          this.fijar(sesion);
        },
        error: (e) => this.errorCarga.set(mensajeDeError(e)),
      });
  }

  // ---- comenzar ----

  iniciar(rutinaId?: string): void {
    this.error.set(null);
    this.terminado.set(null);
    this.iniciando.set(rutinaId ?? 'libre');
    this.sesiones
      .iniciar(rutinaId)
      .pipe(finalize(() => this.iniciando.set(null)))
      .subscribe({
        next: (s) => this.fijar(s),
        error: (e) => this.error.set(mensajeDeError(e)),
      });
  }

  totalSeries(r: Rutina): number {
    return r.ejercicios.reduce((n, e) => n + e.series.length, 0);
  }

  resumenRutina(r: Rutina): string {
    return `${plural(r.ejercicios.length, 'ejercicio', 'ejercicios')}, ${plural(this.totalSeries(r), 'serie', 'series')}`;
  }

  // ---- lectura de la sesión ----

  nombreDe(ejercicioId: string): string {
    return this.catalogo().get(ejercicioId)?.nombre ?? 'Ejercicio';
  }

  modoDe(ejercicioId: string): Modo {
    return modoDeTipo(this.catalogo().get(ejercicioId)?.tipoMedicion);
  }

  hechas(e: EjercicioDeSesion): number {
    return e.series.filter((s) => s.completada).length;
  }

  detalleDe(e: EjercicioDeSesion): string {
    if (e.omitido) return 'Omitido';
    if (e.series.length === 0) return 'Sin series todavía';
    return `${this.hechas(e)} de ${plural(e.series.length, 'serie', 'series')}`;
  }

  filas(e: EjercicioDeSesion): Fila[] {
    const activa = e.series.find((s) => !s.completada)?.orden ?? null;
    const filas: Fila[] = e.series.map((s) => ({
      tipo: s.orden === activa ? 'entrada' : s.completada ? 'hecha' : 'pendiente',
      orden: s.orden,
      serie: s,
    }));
    if (activa === null) filas.push({ tipo: 'entrada', orden: e.series.length + 1, serie: null });
    return filas;
  }

  difiere(s: SerieDeSesion): boolean {
    const o = s.objetivo;
    if (!o) return false;
    return (
      (o.repeticiones !== null && o.repeticiones !== s.repeticiones) ||
      (o.carga !== null && o.carga !== s.carga) ||
      (o.duracionSegundos !== null && o.duracionSegundos !== s.duracionSegundos)
    );
  }

  // ---- registrar ----

  cambiar(orden: number, campo: keyof SerieEscrita, ev: Event): void {
    const valor = valorDe(ev);
    this.borradores.update((b) => ({ ...b, [orden]: { ...b[orden], [campo]: valor } }));
  }

  registrar(e: EjercicioDeSesion): void {
    const s = this.sesion();
    if (!s) return;
    const escrita = this.borradores()[e.orden] ?? { repeticiones: '', carga: '', duracion: '' };
    const { datos, aviso } = armarSerieReal(this.modoDe(e.ejercicioId), escrita);
    if (!datos) {
      this.errorSerie.set({ orden: e.orden, mensaje: aviso ?? 'Revisá los datos de la serie.' });
      return;
    }
    this.errorSerie.set(null);
    this.registrando.set(e.orden);

    this.sesiones
      .registrarSerie(s.id, e.orden, datos)
      .pipe(
        switchMap(() => this.sesiones.ver(s.id)),
        finalize(() => this.registrando.set(null)),
      )
      .subscribe({
        next: (nueva) => this.fijar(nueva, e.orden),
        error: (err) => this.errorSerie.set({ orden: e.orden, mensaje: mensajeDeError(err) }),
      });
  }

  // ---- acciones sobre el ejercicio y la sesión ----

  omitir(e: EjercicioDeSesion): void {
    const s = this.sesion();
    if (!s) return;
    this.error.set(null);
    this.trabajando.set(true);
    this.sesiones
      .omitirEjercicio(s.id, e.orden)
      .pipe(
        switchMap(() => this.sesiones.ver(s.id)),
        finalize(() => this.trabajando.set(false)),
      )
      .subscribe({
        next: (nueva) => this.fijar(nueva, e.orden),
        error: (err) => this.error.set(mensajeDeError(err)),
      });
  }

  async agregarEjercicio(): Promise<void> {
    const s = this.sesion();
    if (!s) return;
    this.error.set(null);
    const modal = await this.modales.create({
      component: SelectorEjercicioComponent,
      initialBreakpoint: 0.8,
      breakpoints: [0, 0.8, 1],
    });
    await modal.present();
    const { data, role } = await modal.onDidDismiss<Ejercicio>();
    if (role !== 'elegido' || !data) return;

    this.trabajando.set(true);
    this.sesiones
      .agregarEjercicio(s.id, data.id)
      .pipe(finalize(() => this.trabajando.set(false)))
      .subscribe({
        next: (nueva) => this.fijar(nueva),
        error: (err) => this.error.set(mensajeDeError(err)),
      });
  }

  finalizar(): void {
    const s = this.sesion();
    if (!s) return;
    this.error.set(null);
    this.trabajando.set(true);
    this.sesiones
      .finalizar(s.id)
      .pipe(finalize(() => this.trabajando.set(false)))
      .subscribe({
        next: (fin) => {
          const hechas = fin.ejercicios.reduce((n, e) => n + this.hechas(e), 0);
          this.terminado.set(`Entrenamiento guardado: ${plural(hechas, 'serie completada', 'series completadas')}.`);
          this.fijar(null);
        },
        error: (err) => this.error.set(mensajeDeError(err)),
      });
  }

  async confirmarAbandonar(): Promise<void> {
    const alerta = await this.alertas.create({
      header: '¿Abandonar este entrenamiento?',
      message: 'No va a contar en tus estadísticas.',
      buttons: [
        { text: 'Seguir entrenando', role: 'cancel' },
        { text: 'Abandonar', role: 'destructive', handler: () => this.abandonar() },
      ],
    });
    await alerta.present();
  }

  private abandonar(): void {
    const s = this.sesion();
    if (!s) return;
    this.error.set(null);
    this.trabajando.set(true);
    this.sesiones
      .abandonar(s.id)
      .pipe(finalize(() => this.trabajando.set(false)))
      .subscribe({
        next: () => this.fijar(null),
        error: (err) => this.error.set(mensajeDeError(err)),
      });
  }

  // ---- estado interno ----

  private fijar(s: Sesion | null, reiniciar?: number): void {
    if (s?.id !== this.sesion()?.id) this.borradores.set({});
    this.sesion.set(s);
    if (!s) return;
    this.borradores.update((b) => {
      const copia = { ...b };
      for (const e of s.ejercicios) {
        if (!(e.orden in copia) || e.orden === reiniciar) copia[e.orden] = this.valoresIniciales(e);
      }
      return copia;
    });
  }

  private valoresIniciales(e: EjercicioDeSesion): SerieEscrita {
    const objetivo = e.series.find((s) => !s.completada)?.objetivo;
    const ultima = [...e.series].reverse().find((s) => s.completada);
    return {
      repeticiones: texto(objetivo?.repeticiones ?? ultima?.repeticiones),
      carga: texto(objetivo?.carga ?? ultima?.carga),
      duracion: texto(objetivo?.duracionSegundos ?? ultima?.duracionSegundos),
    };
  }
}