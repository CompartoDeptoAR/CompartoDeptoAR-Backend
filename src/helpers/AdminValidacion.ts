import { TipoRol } from "../models/tipoRol";
import { UsuarioRepositorio } from "../repository/UsuarioRepositorio";

export function esAdmin(usuarioId?: string) {
  if (!usuarioId) return false;
  return UsuarioRepositorio.buscarPorId(usuarioId).then(u => {
    if (!u) return false;
    return Array.isArray(u.rol) && u.rol.some(r => r.rolId === TipoRol.ADMIN_ROLE);
  });
}