import { Publicacion, PublicacionMini } from "../models/Publcacion";
import { Timestamp } from "firebase-admin/firestore";
import { HabitosUsuario, PreferenciasUsuario } from "../models/Usuario";

export interface PublicacionDto {
  id?: string | undefined;
  titulo: string;
  descripcion: string;
  precio: number;
  ubicacion: string;
  foto?: string[] | undefined;
  reglas?: string[] | undefined;
  preferencias?: PreferenciasUsuario | undefined;
  habitos?: HabitosUsuario| undefined;
  usuarioId: string;
  usuarioNombre?: string | undefined;
  estado: "activa" | "pausada" | "eliminada";
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface PublicacionMinDto {
  id?: string | undefined;
  titulo: string;
  ubicacion: string;
  precio: number;
  foto?: string | undefined;
  estado: "activa" | "pausada" | "eliminada";
}

export function pasarAModelo(dto: PublicacionDto): Publicacion {
  return {
    id: dto.id,
    titulo: dto.titulo,
    descripcion: dto.descripcion,
    precio: dto.precio,
    ubicacion: dto.ubicacion,
    foto: dto.foto,
    reglas: dto.reglas,
    preferencias: dto.preferencias,
    habitos: dto.habitos,
    usuarioId: dto.usuarioId,
    usuarioNombre: dto.usuarioNombre,
    estado: dto.estado || "activa",
    createdAt: dto.createdAt instanceof Date ? Timestamp.fromDate(dto.createdAt) : dto.createdAt,
    updatedAt: dto.updatedAt instanceof Date ? Timestamp.fromDate(dto.updatedAt) : dto.updatedAt,
  };
}

export function pasarADto(modelo: Publicacion): PublicacionDto {
  return {
    id: modelo.id,
    titulo: modelo.titulo,
    descripcion: modelo.descripcion,
    precio: modelo.precio,
    ubicacion: modelo.ubicacion,
    foto: modelo.foto,
    reglas: modelo.reglas,
    preferencias: modelo.preferencias,
    habitos: modelo.habitos,
    usuarioId: modelo.usuarioId,
    usuarioNombre: modelo.usuarioNombre,
    estado: modelo.estado,
    createdAt: modelo.createdAt,
    updatedAt: modelo.updatedAt,
  };
}

export function pasarADtoMin(modelo: PublicacionMini): PublicacionMinDto {
  const primeraFoto = Array.isArray(modelo.foto) && modelo.foto.length > 0
      ? modelo.foto[0]
      : undefined;

  return {
    id: modelo.id,
    titulo: modelo.titulo,
    ubicacion: modelo.ubicacion,
    precio: modelo.precio,
    estado: modelo.estado,
    foto: primeraFoto,

  };
}

