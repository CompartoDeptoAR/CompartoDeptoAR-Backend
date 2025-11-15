import { Publicacion } from "../models/Publcacion";
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
  estado: "activa" | "pausada" | "eliminada";
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface PublicacionMinDto {
  id?: string | undefined;
  titulo: string;
  ubicacion: string;
  precio: number;
  foto?: string[] | undefined;
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
    estado: dto.estado,
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
    estado: modelo.estado,
    createdAt: modelo.createdAt,
    updatedAt: modelo.updatedAt,
  };
}

export function pasarADtoMin(modelo: Publicacion): PublicacionMinDto {
  return {
    id: modelo.id,
    titulo: modelo.titulo,
    ubicacion: modelo.ubicacion,
    precio: modelo.precio,
    foto: modelo.foto
  };
}
