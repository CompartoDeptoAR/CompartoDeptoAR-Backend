import { db } from "../config/firebase";
import { UsuarioPerfil, Usuario } from "../models/Usuario";

export interface UsuarioDto {
  id: string;
  correo: string;
  contraseña: string;
  rol: string;
  fechaCreacion?: Date | undefined;
  perfil: UsuarioPerfil;
}

export function pasarADto(usuario: Usuario): UsuarioDto {
  const usuarioDto: UsuarioDto = {
    id: usuario.id,
    correo: usuario.correo,
    contraseña: usuario.contraseña,
    rol: usuario.rol,
    fechaCreacion: usuario.fechaCreacion,
    perfil: usuario.perfil
  };
  return usuarioDto;
}

export function pasarAModelo(usuarioDto: UsuarioDto): Usuario {
  const usuario: Usuario = {
    id: usuarioDto.id,
    correo: usuarioDto.correo,
    contraseña: usuarioDto.contraseña,
    rol: usuarioDto.rol,
    fechaCreacion: new Date (Number(usuarioDto.fechaCreacion)),
    perfil: usuarioDto.perfil
  };
  return usuario;
}
