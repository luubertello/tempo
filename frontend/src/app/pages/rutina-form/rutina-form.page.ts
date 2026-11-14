import { Component, ElementRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonSpinner,
  IonToolbar,
  ModalController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { chevronDownOutline, chevronUpOutline, closeOutline, trashOutline } from 'ionicons/icons';
import { finalize, forkJoin, of } from 'rxjs';
import { LIMITES } from '../../core/config/limites';
import { Ejercicio } from '../../core/models/ejercicio.model';
import { DatosRutina, Rutina } from '../../core/models/rutina.model';
import { EjerciciosService } from '../../core/services/ejercicios.service';
import { RutinasService } from '../../core/services/rutinas.service';
import { mensajeDeError } from '../../core/utils/errores';
import { etiquetaTipo, formatoDuracion, plural, valorDe } from '../../core/utils/formato';
import { CampoSerie, entero, Modo, modoDeTipo, SerieEscrita, validarSerie } from '../../core/utils/validaciones';
import { CampoNumericoComponent } from '../../shared/components/campo-numerico/campo-numerico.component';
import { SelectorEjercicioComponent } from '../../shared/components/selector-ejercicio/selector-ejercicio.component';

interface EjercicioBorrador {
  ejercicioId: string;
  personalizado: boolean;
  cantidad: string; 
  base: SerieEscrita; 
  series: SerieEscrita[]; 
}

const vacia = (): SerieEscrita => ({ repeticiones: '', carga: '', duracion: '' });
const igual = (a: SerieEscrita, b: SerieEscrita): boolean =>
  a.repeticiones === b.repeticiones && a.carga === b.carga && a.duracion === b.duracion;

const valoresPorDefecto = (modo: Modo): SerieEscrita =>
  modo === 'tiempo' ? { ...vacia(), duracion: '30' } : { ...vacia(), repeticiones: '10' };

const texto = (n: number | null): string => (n === null ? '' : String(n));

@Component({
  selector: 'app-rutina-form',
  templateUrl: './rutina-form.page.html',
  styleUrl: './rutina-form.page.scss',
  imports: [
    IonHeader, IonToolbar, IonButtons, IonBackButton, IonContent, IonInput, IonButton,
    IonIcon, IonSpinner, CampoNumericoComponent,
  ],
})
export class RutinaFormPage implements OnInit {
  private readonly rutinas = inject(RutinasService);
  private readonly catalogoApi = inject(EjerciciosService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly modales = inject(ModalController);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly id = this.route.snapshot.paramMap.get('id');
  readonly esEdicion = this.id !== null;
  readonly volverA = this.id ? `/rutinas/${this.id}` : '/rutinas';

  readonly nombre = signal('');
  readonly ejercicios = signal<EjercicioBorrador[]>([]);
  readonly catalogo = signal<Map<string, Ejercicio>>(new Map());
  readonly listo = signal(false);
  readonly errorCarga = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly errores = signal<Record<string, string>>({}); 
  readonly guardando = signal(false);

  readonly limites = LIMITES;

  constructor() {
    addIcons({ chevronUpOutline, chevronDownOutline, trashOutline, closeOutline });
  }

  ngOnInit(): void {
    forkJoin({
      catalogo: this.catalogoApi.listar(),
      rutina: this.id ? this.rutinas.ver(this.id) : of(null),
    }).subscribe({
      next: ({ catalogo, rutina }) => {
        this.catalogo.set(new Map(catalogo.map((e) => [e.id, e])));
        if (rutina?.origen === 'PREDEFINIDA') {
          this.errorCarga.set('Las rutinas predefinidas no se pueden editar. Usala para crear una copia propia.');
          return;
        }
        if (rutina) this.cargarBorrador(rutina);
        this.listo.set(true);
      },
      error: (e) => this.errorCarga.set(mensajeDeError(e)),
    });
  }

  // ---- datos del catálogo ----

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

  // ---- errores por campo ----

  error_(clave: string): string | null {
    return this.errores()[clave] ?? null;
  }

  limpiar(clave: string): void {
    if (!(clave in this.errores())) return;
    this.errores.update((e) => {
      const { [clave]: _quitado, ...resto } = e;
      return resto;
    });
  }

  // ---- nombre ----

  cambiarNombre(ev: Event): void {
    this.nombre.set(valorDe(ev));
    this.limpiar('nombre');
  }

  // ---- ejercicios ----

  async elegirEjercicio(): Promise<void> {
    this.error.set(null);
    if (this.ejercicios().length >= LIMITES.EJERCICIOS_POR_RUTINA) {
      this.errores.update((e) => ({ ...e, ejercicios: `Una rutina admite hasta ${LIMITES.EJERCICIOS_POR_RUTINA} ejercicios.` }));
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

    this.limpiar('ejercicios');
    const modo = modoDeTipo(data.tipoMedicion);
    this.ejercicios.update((lista) => [
      ...lista,
      { ejercicioId: data.id, personalizado: false, cantidad: '3', base: valoresPorDefecto(modo), series: [] },
    ]);
  }

  quitarEjercicio(i: number): void {
    this.ejercicios.update((lista) => lista.filter((_, k) => k !== i));
    this.errores.set({}); 
  }

  mover(i: number, delta: -1 | 1): void {
    const j = i + delta;
    this.ejercicios.update((lista) => {
      if (j < 0 || j >= lista.length) return lista;
      const copia = [...lista];
      [copia[i], copia[j]] = [copia[j], copia[i]];
      return copia;
    });
    this.errores.set({});
  }


  cambiarCantidad(i: number, valor: string): void {
    this.actualizar(i, (e) => ({ ...e, cantidad: valor }));
    this.limpiar(`e${i}.cantidad`);
  }

  cambiarBase(i: number, campo: CampoSerie, valor: string): void {
    this.actualizar(i, (e) => ({ ...e, base: { ...e.base, [campo]: valor } }));
    this.limpiar(`e${i}.${campo}`);
  }

  resumen(e: EjercicioBorrador): string {
    if (e.personalizado) return '';
    const n = entero(e.cantidad, 1, LIMITES.SERIES_POR_EJERCICIO);
    const { datos } = validarSerie(this.modoDe(e.ejercicioId), e.base, false);
    if (n === null || !datos) return '';

    const series = plural(n, 'serie', 'series');
    if (datos.duracionSegundos !== undefined) return `${series} de ${formatoDuracion(datos.duracionSegundos)}`;
    const reps = `${series} de ${datos.repeticiones} reps`;
    return datos.carga !== undefined ? `${reps} con ${datos.carga.toLocaleString('es-AR')} kg` : reps;
  }


  personalizar(i: number): void {
    this.actualizar(i, (e) => {
      const n = entero(e.cantidad, 1, LIMITES.SERIES_POR_EJERCICIO) ?? 1;
      return { ...e, personalizado: true, series: Array.from({ length: n }, () => ({ ...e.base })) };
    });
    this.errores.set({});
  }

  igualar(i: number): void {
    this.actualizar(i, (e) => ({
      ...e,
      personalizado: false,
      cantidad: String(e.series.length),
      base: { ...e.series[0] },
    }));
    this.errores.set({});
  }

  cambiarSerie(i: number, j: number, campo: CampoSerie, valor: string): void {
    this.actualizar(i, (e) => ({
      ...e,
      series: e.series.map((s, k) => (k === j ? { ...s, [campo]: valor } : s)),
    }));
    this.limpiar(`e${i}.s${j}.${campo}`);
  }

  agregarSerie(i: number): void {
    const actual = this.ejercicios()[i];
    if (actual.series.length >= LIMITES.SERIES_POR_EJERCICIO) {
      this.errores.update((e) => ({ ...e, [`e${i}.series`]: `Un ejercicio admite hasta ${LIMITES.SERIES_POR_EJERCICIO} series.` }));
      return;
    }
    this.limpiar(`e${i}.series`);
    this.actualizar(i, (e) => ({ ...e, series: [...e.series, { ...e.series[e.series.length - 1] }] }));
  }

  quitarSerie(i: number, j: number): void {
    this.actualizar(i, (e) => ({ ...e, series: e.series.filter((_, k) => k !== j) }));
    this.errores.set({});
  }

  private actualizar(i: number, cambio: (e: EjercicioBorrador) => EjercicioBorrador): void {
    this.ejercicios.update((lista) => lista.map((e, k) => (k === i ? cambio(e) : e)));
  }

  private cargarBorrador(r: Rutina): void {
    this.nombre.set(r.nombre);
    this.ejercicios.set(
      r.ejercicios.map((e) => {
        const series: SerieEscrita[] = e.series.map((s) => ({
          repeticiones: texto(s.repeticiones),
          carga: texto(s.carga),
          duracion: texto(s.duracionSegundos),
        }));
        const todasIguales = series.every((s) => igual(s, series[0]));
        return {
          ejercicioId: e.ejercicioId,
          personalizado: !todasIguales,
          cantidad: String(series.length),
          base: { ...series[0] },
          series: todasIguales ? [] : series,
        };
      }),
    );
  }

  // ---- guardar ----

  guardar(): void {
    const { datos, errores } = this.construir();
    this.errores.set(errores);
    if (!datos) {
      this.error.set('Revisá los campos marcados en rojo.');
      this.irAlPrimerError();
      return;
    }
    this.error.set(null);
    this.guardando.set(true);

    const peticion = this.id ? this.rutinas.modificar(this.id, datos) : this.rutinas.crear(datos);
    peticion.pipe(finalize(() => this.guardando.set(false))).subscribe({
      next: (r) => this.router.navigateByUrl(`/rutinas/${r.id}`, { replaceUrl: true }),
      error: (e) => this.error.set(mensajeDeError(e)),
    });
  }

  private construir(): { datos?: DatosRutina; errores: Record<string, string> } {
    const errores: Record<string, string> = {};
    const nombre = this.nombre().trim();
    if (!nombre) errores['nombre'] = 'Ponele un nombre a la rutina.';
    else if (nombre.length > LIMITES.NOMBRE_MAX) errores['nombre'] = `El nombre puede tener hasta ${LIMITES.NOMBRE_MAX} caracteres.`;

    const lista = this.ejercicios();
    if (lista.length === 0) errores['ejercicios'] = 'Agregá al menos un ejercicio.';

    const ejercicios: DatosRutina['ejercicios'] = [];
    lista.forEach((e, i) => {
      const modo = this.modoDe(e.ejercicioId);

      if (!e.personalizado) {
        const n = entero(e.cantidad, 1, LIMITES.SERIES_POR_EJERCICIO);
        if (n === null) errores[`e${i}.cantidad`] = `Poné entre 1 y ${LIMITES.SERIES_POR_EJERCICIO} series.`;
        const v = validarSerie(modo, e.base, false);
        for (const [campo, mensaje] of Object.entries(v.errores)) errores[`e${i}.${campo}`] = mensaje;
        if (n !== null && v.datos) {
          ejercicios.push({ ejercicioId: e.ejercicioId, series: Array.from({ length: n }, () => ({ ...v.datos! })) });
        }
        return;
      }

      const series: DatosRutina['ejercicios'][number]['series'] = [];
      e.series.forEach((s, j) => {
        const v = validarSerie(modo, s, false);
        for (const [campo, mensaje] of Object.entries(v.errores)) errores[`e${i}.s${j}.${campo}`] = mensaje;
        if (v.datos) series.push(v.datos);
      });
      if (series.length === e.series.length) ejercicios.push({ ejercicioId: e.ejercicioId, series });
    });

    return Object.keys(errores).length > 0 ? { errores } : { datos: { nombre, ejercicios }, errores };
  }

  private irAlPrimerError(): void {
    setTimeout(() => {
      const el = this.host.nativeElement.querySelector<HTMLElement>('.error-campo, [aria-invalid="true"]');
      if (!el) return;
      const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({ block: 'center', behavior: sinMovimiento ? 'auto' : 'smooth' });
      if (el.tagName === 'INPUT') el.focus({ preventScroll: true });
    });
  }
}