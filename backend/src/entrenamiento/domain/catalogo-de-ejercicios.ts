import { TipoMedicion } from "../../catalogo/domain/tipo-medicion";

export abstract class CatalogoDeEjercicios {
  abstract tiposDeMedicion(ids: string[]): Promise<Map<string, TipoMedicion>>;
}