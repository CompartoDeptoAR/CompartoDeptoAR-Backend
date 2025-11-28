import { FiltrosBusqueda, Publicacion, PublicacionMini } from "../models/Publcacion";
import { pasarADto, pasarADtoMin, pasarAModelo, PublicacionDto, PublicacionMinDto } from "../dtos/publicacionesDto";
import { PublicacionRepositorio } from "../repository/PublicacionRepositorio";
import { UsuarioRepositorio } from "../repository/UsuarioRepositorio";
import { esAdmin } from "../helpers/AdminValidacion";
import { time, timeStamp } from "console";
import { Timestamp } from "firebase-admin/firestore";

export class PublicacionServicio {

  async crear(datos: PublicacionDto): Promise<PublicacionDto> {
    if (!datos.titulo || datos.titulo.trim().length < 3) {
      throw { status: 400, message: "El título debe tener al menos 3 caracteres" };
      }
      const publicacion: Omit<Publicacion, "id"> = pasarAModelo(datos);
      const creada = await PublicacionRepositorio.crear(publicacion);
      return pasarADto(creada);
  }
  async misPublicaciones(usuarioId: string): Promise<PublicacionDto[]> {
    const misPublicaciones = await PublicacionRepositorio.misPublicaciones(usuarioId);
    return misPublicaciones.map(p => pasarADto(p));
  }

  async traerTodas(): Promise<{ publicaciones: PublicacionMinDto[], mensaje?: string }> {
    const publicaciones = await PublicacionRepositorio.traerTodas();

    if (!publicaciones.length) {
      return { publicaciones: [], mensaje: "No hay publicaciones disponibles" };
    }
    return {
      publicaciones: publicaciones.map(p => pasarADtoMin(p))
    };
  }

  static async obtenerPorId(id: string): Promise<Publicacion | null> {
    if (!id) throw new Error("ID invalido");
    const publicacion = await PublicacionRepositorio.obtenerPorId(id);
    return publicacion;
  }
  async traerPaginadas(limit: number,startAfterId?: string): Promise<{ publicaciones: PublicacionMinDto[], ultId?: string | undefined }> {
    const { publicaciones, ultId } = await PublicacionRepositorio.traerPaginadas(limit, startAfterId);
    return {
      publicaciones: publicaciones.map(p => pasarADtoMin(p)),
      ultId
    };
  }

  async actualizar(idUsuario: string, idPublicacion: string, datos: Partial<Publicacion>): Promise<void> {
    await PublicacionRepositorio.actualizar(idUsuario, idPublicacion, datos);
  }

  async eliminar(id: string, usuarioId: string): Promise<void> {
    const publicacion = await PublicacionRepositorio.obtenerPorId(id);
    if (!publicacion) throw { status: 404, message: "Publicación no encontrada" };
    const esOwner = publicacion.usuarioId === usuarioId;
    const esAdministrador = await esAdmin(usuarioId);

    if (!esOwner && !esAdministrador) {
      throw { status: 403, message: "No tenes permiso para eliminar esta publicacion" };
    }
    await PublicacionRepositorio.eliminar(id);
  }

  async buscar(texto: string): Promise<PublicacionDto[]> {
    const publicaciones = await PublicacionRepositorio.buscar(texto);
    return publicaciones.map(p => pasarADto(p));
  }

  async buscarConFiltros(filtros: FiltrosBusqueda): Promise<PublicacionDto[]> {
    const publicaciones = await PublicacionRepositorio.buscarConFiltros(filtros);

    if (publicaciones.length === 0) {
      throw { status: 404, message: "No se encontraron publicaciones con esos filtros." };
    }
    return publicaciones.map(p => pasarADto(p));
  }
}