import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AlertController, IonButton, IonContent, IonSpinner, ModalController } from '@ionic/angular';
import { finalize, forkJoin, switchMap } from 'rxjs';
import { LIMITES } from '../../core/config/limites';
import { Ejercicio } from '../../core/models/ejercicio.model';
import { Rutina } from '../../core/models/rutina.model';
import { EjercicioDeSesion, SerieDeSesion, Sesion, Veredicto } from '../../core/models/sesion.model';
import { EjerciciosService } from '../../core/services/ejercicios.service';
import { RutinasService } from '../../core/services/rutinas.service';
import { SesionesService } from '../../core/services/sesiones.service';
import { mensajeDeError } from '../../core/utils/errores';
import { formatoFecha, plural, textoSerie } from '../../core/utils/formato';
import { armarSerieReal, Modo, modoDeTipo, SerieEscrita } from '../../core/utils/validaciones';
import { CampoNumericoComponent } from '../../shared/components/campo-numerico/campo-numerico.component';
import { CompasComponent } from '../../shared/components/compas/compas.component';
import { SelectorEjercicioComponent } from '../../shared/components/selector-ejercicio/selector-ejercicio.component';
import { estadosDeEjercicio, frase, lineasDeBalance, simboloDe, titularDeBalance } from '../../core/utils/veredicto';

interface RegistroReciente {
  ejercicio: number;
  veredicto: Veredicto;
  texto: string;
}

const texto = (n: number | null | undefined): string => (n === null || n === undefined ? '' : String(n));
const vacia = (): SerieEscrita => ({ repeticiones: '', carga: '', duracion: '' });

@Component({
  selector: 'app-entrenar',
  templateUrl: './entrenar.page.html',
  styleUrl: './entrenar.page.scss',
  imports: [IonContent, IonButton, IonSpinner, RouterLink, CompasComponent, CampoNumericoComponent],
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

  readonly abierto = signal<number | null>(null); 
  readonly extra = signal<number | null>(null); 
  readonly registro = signal<RegistroReciente | null>(null);
  readonly cierre = signal<Sesion | null>(null); 

  readonly cargando = signal(true);
  readonly errorCarga = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly errorSerie = signal<{ orden: number; mensaje: string } | null>(null);
  readonly trabajando = signal(false);
  readonly registrando = signal<number | null>(null);
  readonly iniciando = signal<string | null>(null);

  readonly limites = LIMITES;
  readonly textoSerie = textoSerie;
  readonly frase = frase;
  readonly simbolo = simboloDe;
  readonly formatoFecha = formatoFecha;
  readonly estadosDe = (e: EjercicioDeSesion) => estadosDeEjercicio(e, true);
  readonly estadosFin = (e: EjercicioDeSesion) => estadosDeEjercicio(e, false);

  readonly titulo = computed(() => this.sesion()?.nombreRutina ?? 'Entrenamiento libre');
  readonly fecha = computed(() => {
    const s = this.sesion();
    return s ? formatoFecha(s.fechaSesion) : '';
  });

  readonly activo = computed<EjercicioDeSesion | null>(() => {
    const s = this.sesion();
    if (!s) return null;
    const elegido = s.ejercicios.find((e) => e.orden === this.abierto());
    return elegido ?? s.ejercicios.find((e) => this.necesitaAtencion(e)) ?? s.ejercicios.at(-1) ?? null;
  });

  // ---- pantalla de cierre ----

    readonly titularCierre = computed(() => {
    const b = this.cierre()?.balance;
    return b ? titularDeBalance(b) : '';
  });

  readonly lineasCierre = computed(() => {
    const b = this.cierre()?.balance;
    return b ? lineasDeBalance(b) : [];
  });

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
          if (sesion) this.cierre.set(null);
          this.aplicar(sesion);
        },
        error: (e) => this.errorCarga.set(mensajeDeError(e)),
      });
  }

  // ---- comenzar ----

  iniciar(rutinaId?: string): void {
    this.error.set(null);
    this.cierre.set(null);
    this.iniciando.set(rutinaId ?? 'libre');
    this.sesiones
      .iniciar(rutinaId)
      .pipe(finalize(() => this.iniciando.set(null)))
      .subscribe({
        next: (s) => this.aplicar(s),
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

  detalleDe(e: EjercicioDeSesion): string {
    if (e.omitido) return 'Omitido';
    if (e.series.length === 0) return 'Sin series todavía';
    const hechas = e.series.filter((s) => s.completada).length;
    return `${hechas} de ${plural(e.series.length, 'serie', 'series')}`;
  }

  serieActiva(e: EjercicioDeSesion): SerieDeSesion | null {
    return e.series.find((s) => !s.completada) ?? null;
  }

  esLibre(e: EjercicioDeSesion): boolean {
    return e.series.every((s) => s.objetivo === null);
  }

  necesitaAtencion(e: EjercicioDeSesion): boolean {
    return !e.omitido && (e.series.length === 0 || e.series.some((s) => !s.completada));
  }

  mostrarEntrada(e: EjercicioDeSesion): boolean {
    return this.serieActiva(e) !== null || this.esLibre(e) || this.extra() === e.orden;
  }

  numeroSerie(e: EjercicioDeSesion): number {
    return this.serieActiva(e)?.orden ?? e.series.length + 1;
  }

  tituloSerie(e: EjercicioDeSesion): string {
    const activa = this.serieActiva(e);
    return activa ? `Serie ${activa.orden} de ${e.series.length}` : `Serie ${e.series.length + 1}`;
  }

  textoSinObjetivo(e: EjercicioDeSesion): string {
    if (!this.esLibre(e)) return 'Serie extra, fuera del plan.';
    return e.series.length === 0 ? 'Sin objetivo: registrá lo que hagas.' : 'Sin objetivo.';
  }

  siguiente(e: EjercicioDeSesion): EjercicioDeSesion | null {
    const s = this.sesion();
    if (!s) return null;
    return s.ejercicios.find((x) => x.orden > e.orden && this.necesitaAtencion(x)) ?? null;
  }

  abrir(orden: number): void {
    this.abierto.set(orden);
    this.extra.set(null);
    this.registro.set(null);
    this.errorSerie.set(null);
  }

  // ---- registrar ----

  escribir(orden: number, campo: keyof SerieEscrita, valor: string): void {
    this.borradores.update((b) => ({ ...b, [orden]: { ...(b[orden] ?? vacia()), [campo]: valor } }));
  }

  registrar(e: EjercicioDeSesion): void {
    const s = this.sesion();
    if (!s) return;
    const { datos, aviso } = armarSerieReal(this.modoDe(e.ejercicioId), this.borradores()[e.orden] ?? vacia());
    if (!datos) {
      this.errorSerie.set({ orden: e.orden, mensaje: aviso ?? 'Revisá los datos de la serie.' });
      return;
    }
    this.errorSerie.set(null);
    this.registro.set(null);
    this.registrando.set(e.orden);
    const ordenSerie = this.numeroSerie(e); 

    this.sesiones
      .registrarSerie(s.id, e.orden, datos)
      .pipe(
        switchMap(() => this.sesiones.ver(s.id)),
        finalize(() => this.registrando.set(null)),
      )
      .subscribe({
        next: (nueva) => {
          this.aplicar(nueva, e.orden);
          this.extra.set(null);
          this.abierto.set(e.orden);  
          const serie = nueva.ejercicios.find((x) => x.orden === e.orden)?.series.find((x) => x.orden === ordenSerie);
          if (serie) this.registro.set({ ejercicio: e.orden, veredicto: serie.veredicto, texto: frase(serie) });
        },
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
        next: (nueva) => {
          this.aplicar(nueva, e.orden);
          this.abierto.set(null); 
          this.registro.set(null);
        },
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
        next: (nueva) => {
          this.aplicar(nueva);
          this.abrir(nueva.ejercicios.length); 
        },
        error: (err) => this.error.set(mensajeDeError(err)),
      });
  }

  async finalizar(): Promise<void> {
    const s = this.sesion();
    if (!s) return;
    const pendientes = s.balance.sinHacer;
    if (pendientes > 0) {
      const alerta = await this.alertas.create({
        header: '¿Finalizar el entrenamiento?',
        message: `Te quedaron ${plural(pendientes, 'serie', 'series')} del plan sin hacer. Se guardan como no hechas.`,
        buttons: [
          { text: 'Seguir entrenando', role: 'cancel' },
          { text: 'Finalizar', role: 'confirm' },
        ],
      });
      await alerta.present();
      const { role } = await alerta.onDidDismiss();
      if (role !== 'confirm') return;
    }
    this.finalizarYa(s.id);
  }

  private finalizarYa(id: string): void {
    this.error.set(null);
    this.trabajando.set(true);
    this.sesiones
      .finalizar(id)
      .pipe(finalize(() => this.trabajando.set(false)))
      .subscribe({
        next: (fin) => {
          this.cierre.set(fin);
          this.aplicar(null);
        },
        error: (err) => this.error.set(mensajeDeError(err)),
      });
  }

  cerrarResumen(): void {
    this.cierre.set(null);
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
        next: () => this.aplicar(null),
        error: (err) => this.error.set(mensajeDeError(err)),
      });
  }

  // ---- estado interno ----

  private aplicar(s: Sesion | null, reiniciar?: number): void {
    if (s?.id !== this.sesion()?.id) {
      this.borradores.set({});
      this.abierto.set(null);
      this.extra.set(null);
      this.registro.set(null);
    }
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