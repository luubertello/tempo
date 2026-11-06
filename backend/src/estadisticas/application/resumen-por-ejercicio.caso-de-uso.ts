import { SesionesFinalizadas } from '../../entrenamiento/published/sesiones-finalizadas';
import { calcularResumen, ResumenDeEjercicio } from '../domain/calculos';
import { CatalogoParaEstadisticas } from '../domain/catalogo-para-estadisticas';

export class ResumenPorEjercicioCasoDeUso {
  constructor(
    private readonly sesiones: SesionesFinalizadas,
    private readonly catalogo: CatalogoParaEstadisticas,
  ) {}

  async ejecutar(e: { usuarioId: string }): Promise<ResumenDeEjercicio[]> {
    const sesiones = await this.sesiones.deUsuario(e.usuarioId);
    const ids = [...new Set(sesiones.flatMap((s) => s.ejercicios.map((x) => x.ejercicioId)))];
    const datos = await this.catalogo.datosDe(ids);
    return calcularResumen(sesiones, datos);
  }
}