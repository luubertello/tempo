import { Component, inject, OnInit, signal } from '@angular/core';
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
import { DatosRutina, DatosSerie, Rutina } from '../../core/models/rutina.model';
import { EjerciciosService } from '../../core/services/ejercicios.service';
import { RutinasService } from '../../core/services/rutinas.service';
import { mensajeDeError } from '../../core/utils/errores';
import { etiquetaTipo, valorDe } from '../../core/utils/formato';
import { SelectorEjercicioComponent } from '../../shared/components/selector-ejercicio/selector-ejercicio.component';
import { decimal, entero } from '../../core/utils/validaciones';

type Modo = 'conCarga' | 'reps' | 'tiempo';

interface SerieBorrador {
  repeticiones: string;
  carga: string;
  duracion: string;
}
interface EjercicioBorrador {
  ejercicioId: string;
  series: SerieBorrador[];
}

const serieVacia = (): SerieBorrador => ({ repeticiones: '', carga: '', duracion: '' });

@Component({
  selector: 'app-rutina-form',
  templateUrl: './rutina-form.page.html',
  styleUrl: './rutina-form.page.scss',
  imports: [IonHeader, IonToolbar, IonButtons, IonBackButton, IonContent, IonInput, IonButton, IonIcon, IonSpinner],
})
export class RutinaFormPage implements OnInit {
  private readonly rutinas = inject(RutinasService);
  private readonly catalogoApi = inject(EjerciciosService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly modales = inject(ModalController);

  readonly id = this.route.snapshot.paramMap.get('id');
  readonly esEdicion = this.id !== null;
  readonly volverA = this.id ? `/rutinas/${this.id}` : '/rutinas';

  readonly nombre = signal('');
  readonly ejercicios = signal<EjercicioBorrador[]>([]);
  readonly catalogo = signal<Map<string, Ejercicio>>(new Map());
  readonly listo = signal(false);
  readonly errorCarga = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly guardando = signal(false);

  readonly valorDe = valorDe;

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
    switch (this.catalogo().get(ejercicioId)?.tipoMedicion) {
      case 'REPETICIONES_CON_CARGA':
        return 'conCarga';
      case 'TIEMPO':
        return 'tiempo';
      default:
        return 'reps';
    }
  }

  // ---- edición del borrador ----

  async elegirEjercicio(): Promise<void> {
    this.error.set(null);
    if (this.ejercicios().length >= LIMITES.EJERCICIOS_POR_RUTINA) {
      this.error.set(`Una rutina admite hasta ${LIMITES.EJERCICIOS_POR_RUTINA} ejercicios.`);
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
    this.ejercicios.update((lista) => [...lista, { ejercicioId: data.id, series: [serieVacia()] }]);
  }

  quitarEjercicio(i: number): void {
    this.ejercicios.update((lista) => lista.filter((_, k) => k !== i));
  }

  mover(i: number, delta: -1 | 1): void {
    const j = i + delta;
    this.ejercicios.update((lista) => {
      if (j < 0 || j >= lista.length) return lista;
      const copia = [...lista];
      [copia[i], copia[j]] = [copia[j], copia[i]];
      return copia;
    });
  }

  agregarSerie(i: number): void {
    const actual = this.ejercicios()[i];
    if (actual.series.length >= LIMITES.SERIES_POR_EJERCICIO) {
      this.error.set(`Un ejercicio admite hasta ${LIMITES.SERIES_POR_EJERCICIO} series.`);
      return;
    }
    this.error.set(null);
    this.actualizar(i, (e) => ({ ...e, series: [...e.series, { ...e.series[e.series.length - 1] }] }));
  }

  quitarSerie(i: number, j: number): void {
    this.actualizar(i, (e) => ({ ...e, series: e.series.filter((_, k) => k !== j) }));
  }

  cambiar(i: number, j: number, campo: keyof SerieBorrador, ev: Event): void {
    const valor = valorDe(ev);
    this.actualizar(i, (e) => ({
      ...e,
      series: e.series.map((s, k) => (k === j ? { ...s, [campo]: valor } : s)),
    }));
  }

  private actualizar(i: number, cambio: (e: EjercicioBorrador) => EjercicioBorrador): void {
    this.ejercicios.update((lista) => lista.map((e, k) => (k === i ? cambio(e) : e)));
  }

  private cargarBorrador(r: Rutina): void {
    this.nombre.set(r.nombre);
    this.ejercicios.set(
      r.ejercicios.map((e) => ({
        ejercicioId: e.ejercicioId,
        series: e.series.map((s) => ({
          repeticiones: s.repeticiones === null ? '' : String(s.repeticiones),
          carga: s.carga === null ? '' : String(s.carga),
          duracion: s.duracionSegundos === null ? '' : String(s.duracionSegundos),
        })),
      })),
    );
  }

  // ---- guardar ----

  guardar(): void {
    const { datos, aviso } = this.construir();
    if (!datos) {
      this.error.set(aviso ?? 'Revisá los datos de la rutina.');
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

  private construir(): { datos?: DatosRutina; aviso?: string } {
    const nombre = this.nombre().trim();
    if (!nombre) return { aviso: 'Ponele un nombre a la rutina.' };
    if (nombre.length > LIMITES.NOMBRE_MAX) {
      return { aviso: `El nombre puede tener hasta ${LIMITES.NOMBRE_MAX} caracteres.` };
    }
    const lista = this.ejercicios();
    if (lista.length === 0) return { aviso: 'Agregá al menos un ejercicio.' };

    const ejercicios: DatosRutina['ejercicios'] = [];
    for (const e of lista) {
      const modo = this.modoDe(e.ejercicioId);
      const series: DatosSerie[] = [];

      for (const [j, s] of e.series.entries()) {
        const donde = `${this.nombreDe(e.ejercicioId)}, serie ${j + 1}`;

        if (modo === 'tiempo') {
          const d = entero(s.duracion, 1, LIMITES.DURACION_MAX_SEGUNDOS);
          if (d === null) {
            return { aviso: `${donde}: la duración tiene que ser un número entero de segundos, entre 1 y ${LIMITES.DURACION_MAX_SEGUNDOS}.` };
          }
          series.push({ duracionSegundos: d });
          continue;
        }

        const r = entero(s.repeticiones, 1, LIMITES.REPETICIONES_MAX);
        if (r === null) {
          return { aviso: `${donde}: las repeticiones tienen que ser un número entero, entre 1 y ${LIMITES.REPETICIONES_MAX}.` };
        }
        if (modo === 'reps' || s.carga.trim() === '') {
          series.push({ repeticiones: r }); // en el plan, la carga es opcional
          continue;
        }
        const c = decimal(s.carga, LIMITES.CARGA_MAX_KG);
        if (c === null) {
          return { aviso: `${donde}: la carga tiene que ser mayor a 0 y hasta ${LIMITES.CARGA_MAX_KG} kg, con hasta 2 decimales.` };
        }
        series.push({ repeticiones: r, carga: c });
      }
      ejercicios.push({ ejercicioId: e.ejercicioId, series });
    }
    return { datos: { nombre, ejercicios } };
  }
}