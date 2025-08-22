import { db } from "../config/firebase";
import { Publicacion } from "../models/Publcacion";
import {UsuarioConId,PreferenciasUsuario} from "../models/Usuario";

export interface PublicacionDto{
    id?: string | undefined;
    titulo: string;
    descripcion: string;
    precio: number;
    ubicacion: string;
    foto?: string[] | undefined;
    reglas?: string[] | undefined;
    preferencias?: PreferenciasUsuario | undefined;
    usuarioId: UsuarioConId["id"];
    estado: "activa" | "pausada" | "eliminada";
    createdAt: string;
    updatedAt: string;
}

export function pasarADto(publicacion: Publicacion): Publicacion {
  const publicacionDto: Publicacion = {
    id: publicacion.id,
    titulo: publicacion.titulo,
    descripcion: publicacion.descripcion,
    precio: publicacion.precio,
    ubicacion: publicacion.ubicacion,
    foto: publicacion.foto,
    reglas: publicacion.reglas,
    preferencias:publicacion.preferencias,
    usuarioId: publicacion.usuarioId,
    estado: publicacion.estado,
    createdAt: publicacion.createdAt,
    updatedAt: publicacion.updatedAt
  };
  return publicacion;
}

export function pasarAModelo(publicacionDto: PublicacionDto): Publicacion {
  const publicacion: Publicacion = {
    id: publicacionDto.id ?? "",
    titulo: publicacionDto.titulo,
    descripcion: publicacionDto.descripcion,
    precio: publicacionDto.precio,
    ubicacion: publicacionDto.ubicacion,
    foto: publicacionDto.foto,
    reglas: publicacionDto.reglas,
    preferencias: publicacionDto.preferencias,
    usuarioId: publicacionDto.usuarioId,
    estado: publicacionDto.estado,
    createdAt: publicacionDto.createdAt ?? new Date(),
    updatedAt: publicacionDto.updatedAt ?? new Date(),
  };

  return publicacion;
}