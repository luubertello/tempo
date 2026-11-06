import { TipoMedicion } from '../../catalogo/domain/tipo-medicion';

export interface DatosDeEjercicio {
  nombre: string;
  tipoMedicion: TipoMedicion;
}

export abstract class CatalogoParaEstadisticas {
  abstract datosDe(ids: string[]): Promise<Map<string, DatosDeEjercicio>>;
}