import { Timestamp } from "firebase-admin/firestore";
import { UsuarioPerfil, Usuario, UsuarioRol, UsuarioConId, PreferenciasUsuario, HabitosUsuario } from "../models/Usuario";

export interface UsuarioDto {
  id: any;
  correo: string;
  firebaseUid?: string | undefined;
  rol: UsuarioRol[];
  fechaCreacion?: Timestamp | undefined;
  perfil: UsuarioPerfil;
  promedioCalificaciones: number | undefined;
  cantidadCalificaciones: number | undefined;
}

export interface RegistrarUsuarioDto {
  correo: string;
  contraseña: string;
  firebaseUid: string;
  perfil: {
    nombreCompleto: string;
    edad: number;
    genero?: string;
    descripcion?: string;
    preferencias?: PreferenciasUsuario;
    habitos?: HabitosUsuario;
  };
}

export function pasarADto(usuario: UsuarioConId): UsuarioDto {
  const usuarioDto: UsuarioDto = {
    id: usuario.id,
    correo: usuario.correo,
    rol: usuario.rol.map(r => ({
      id: r.id,
      rolId: r.rolId
    })),
    fechaCreacion: usuario.fechaCreacion ?? Timestamp.now(),
    perfil: usuario.perfil,
    promedioCalificaciones: usuario.promedioCalificaciones,
    cantidadCalificaciones: usuario.cantidadCalificaciones
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
    perfil: usuarioDto.perfil,
    promedioCalificaciones: usuarioDto.promedioCalificaciones,
    cantidadCalificaciones: usuarioDto.cantidadCalificaciones
  };
  return usuario;
}
