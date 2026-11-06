import { TipoMedicion } from '../../catalogo/domain/tipo-medicion';
import {
  EjercicioPublicado,
  SesionFinalizadaPublicada,
} from '../../entrenamiento/published/sesiones-finalizadas';
import { DatosDeEjercicio } from './catalogo-para-estadisticas';
import { Unidad, unidadDe, valorDe } from './unidad';

export interface ResumenDeEjercicio {
  ejercicioId: string;
  nombre: string;
  unidad: Unidad;
  vecesRealizado: number;
  marcaMaxima: number;
}

export interface PuntoDeEvolucion {
  fechaSesion: string;
  valor: number;
}

function marcaDe(tipo: TipoMedicion, series: EjercicioPublicado['series']): number | null {
  const valores = series.map((s) => valorDe(tipo, s)).filter((v): v is number => v !== null);
  return valores.length > 0 ? Math.max(...valores) : null;
}

export function calcularResumen(
  sesiones: SesionFinalizadaPublicada[],
  catalogo: ReadonlyMap<string, DatosDeEjercicio>,
): ResumenDeEjercicio[] {
  const acumulado = new Map<string, { vecesRealizado: number; marcaMaxima: number }>();

  for (const sesion of sesiones) {
    const contadosEnEstaSesion = new Set<string>();
    for (const e of sesion.ejercicios) {
      const datos = catalogo.get(e.ejercicioId);
      if (!datos) continue;
      const marca = marcaDe(datos.tipoMedicion, e.series);
      if (marca === null) continue;

      const actual = acumulado.get(e.ejercicioId) ?? { vecesRealizado: 0, marcaMaxima: marca };
      if (!contadosEnEstaSesion.has(e.ejercicioId)) {
        actual.vecesRealizado += 1;
        contadosEnEstaSesion.add(e.ejercicioId);
      }
      actual.marcaMaxima = Math.max(actual.marcaMaxima, marca);
      acumulado.set(e.ejercicioId, actual);
    }
  }

  return [...acumulado]
    .map(([ejercicioId, a]) => {
      const datos = catalogo.get(ejercicioId)!; 
      return {
        ejercicioId,
        nombre: datos.nombre,
        unidad: unidadDe(datos.tipoMedicion),
        vecesRealizado: a.vecesRealizado,
        marcaMaxima: a.marcaMaxima,
      };
    })
    .sort((a, b) => b.vecesRealizado - a.vecesRealizado || a.nombre.localeCompare(b.nombre, 'es'));
}

export function calcularEvolucion(
  sesiones: SesionFinalizadaPublicada[],
  ejercicioId: string,
  tipo: TipoMedicion,
): PuntoDeEvolucion[] {
  const porFecha = new Map<string, number>();
  for (const s of sesiones) {
    for (const e of s.ejercicios) {
      if (e.ejercicioId !== ejercicioId) continue;
      const marca = marcaDe(tipo, e.series);
      if (marca === null) continue;
      porFecha.set(s.fechaSesion, Math.max(porFecha.get(s.fechaSesion) ?? marca, marca));
    }
  }
  return [...porFecha]
    .map(([fechaSesion, valor]) => ({ fechaSesion, valor }))
    .sort((a, b) => a.fechaSesion.localeCompare(b.fechaSesion));
}