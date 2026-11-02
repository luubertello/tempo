import { SesionNoEncontrada } from '../domain/errores-sesion';
import { Sesion } from '../domain/sesion';
import { SesionRepositorio } from '../domain/sesion.repositorio';

export async function cargarSesionDe(
  sesiones: SesionRepositorio,
  usuarioId: string,
  sesionId: string,
): Promise<Sesion> {
  const sesion = await sesiones.buscarPorId(sesionId);
  if (!sesion || sesion.usuarioId !== usuarioId) throw new SesionNoEncontrada();
  return sesion;
}