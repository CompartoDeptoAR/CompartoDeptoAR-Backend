import { Timestamp } from "firebase-admin/firestore";
import { UsuarioPerfil, Usuario, UsuarioRol, UsuarioConId } from "../models/Usuario";

export interface UsuarioDto {
  correo: string;
  rol: UsuarioRol[];
  fechaCreacion?: Timestamp | undefined;
  perfil: UsuarioPerfil;
}

export function pasarADto(usuario: UsuarioConId): UsuarioDto {
  const usuarioDto: UsuarioDto = {
    correo: usuario.correo,
    rol: usuario.rol.map(r => ({
      id: r.id,
      rolId: r.rolId
    })),
    fechaCreacion: usuario.fechaCreacion ?? Timestamp.now(),
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
    fechaCreacion: usuarioDto.fechaCreacion ?? Timestamp.now(),
    perfil: usuarioDto.perfil
  };
  return usuario;
}
