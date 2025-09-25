import { UsuarioPerfil, Usuario, UsuarioRol, UsuarioConId } from "../models/Usuario";

export interface UsuarioDto {
  correo: string;
  rol: UsuarioRol[];
  fechaCreacion?: Date | undefined;
  perfil: UsuarioPerfil;
}

export function pasarADto(usuario: UsuarioConId): UsuarioDto {
  const usuarioDto: UsuarioDto = {
    correo: usuario.correo,
    rol:  usuario.rol.map(r => ({
      id: r.id,
      rolId: r.rolId
    })),
    fechaCreacion: usuario.fechaCreacion,
    perfil: usuario.perfil
  };
  return usuarioDto;
}

export function pasarAModelo(usuarioDto: UsuarioDto, id: string, contraseña: string): Usuario {
  const usuario: Usuario = {
    id,
    correo: usuarioDto.correo,
    contraseña,
    rol: usuarioDto.rol,
    fechaCreacion: usuarioDto.fechaCreacion
      ? new Date(usuarioDto.fechaCreacion)
      : new Date(),
    perfil: usuarioDto.perfil
  };
  return usuario;
}
