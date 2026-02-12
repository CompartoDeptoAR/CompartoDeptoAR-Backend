import { FiltrosBusqueda, Publicacion } from "../models/Publcacion";
import {pasarADto,pasarADtoMin,pasarAModelo,PublicacionDto,PublicacionMinDto} from "../dtos/publicacionesDto";
import { PublicacionRepositorio } from "../repository/PublicacionRepositorio";
import { esAdmin } from "../helpers/AdminValidacion";
import { UsuarioRepositorio } from "../repository/UsuarioRepositorio";
import { AppError } from "../error/AppError";

export class PublicacionServicio {

  async crear(datos: PublicacionDto): Promise<PublicacionDto> {
    if (!datos.titulo || datos.titulo.trim().length < 3) {
      throw new AppError("El titulo tiene q tener al menos 3 caracteres", 400);
    }

    const usuario = await UsuarioRepositorio.buscarPorId(datos.usuarioId);
    if (!usuario) {
      throw new AppError("Usuario no encontrado", 404);
    }

    datos.usuarioNombre = usuario.perfil.nombreCompleto;
    if (usuario.firebaseUid) {
      datos.usuarioFirebaseUid = usuario.firebaseUid;
    }

    const publicacion = pasarAModelo(datos);
    const creada = await PublicacionRepositorio.crear(publicacion);
    return pasarADto(creada);
  }

  async misPublicaciones(usuarioId: string): Promise<PublicacionDto[]> {
    const publicaciones = await PublicacionRepositorio.misPublicaciones(usuarioId);
    return publicaciones.map(p => pasarADto(p));
  }

  async traerTodas(): Promise<{ publicaciones: PublicacionMinDto[], mensaje?: string }> {
    const publicaciones = await PublicacionRepositorio.traerTodas();
    if (!publicaciones.length) {
      return { publicaciones: [], mensaje: "No hay publicaciones disponibles" };
    }
    return { publicaciones: publicaciones.map(p => pasarADtoMin(p)) };
  }

    async traerTodasAdmin(): Promise<{ publicaciones: PublicacionMinDto[], mensaje?: string }> {
    const publicaciones = await PublicacionRepositorio.traerTodasAdmin();
    if (!publicaciones.length) {
      return { publicaciones: [], mensaje: "No hay publicaciones disponibles" };
    }
    return { publicaciones: publicaciones.map(p => pasarADtoMin(p)) };
  }

  async obtenerPorId(id: string): Promise<Publicacion | null> {
    if (!id) throw new AppError("ID invalido", 400);
    return PublicacionRepositorio.obtenerPorId(id);
  }

  async obtenerPorIdAdmin(id: string): Promise<Publicacion | null> {
  if (!id) throw new AppError("ID invalido", 400);
    return PublicacionRepositorio.obtenerPorId(id);
  }

  async cambiarEstado( publicacionId: string,usuarioId: string,nuevoEstado: "activa" | "pausada" | "eliminada"): Promise<{ success: boolean; message: string }> {

    // Dejo try/catch porq este metodo devuelve resultado controlado
    // y no errores HTTP directos.
    try {
      const publicacion = await PublicacionRepositorio.obtenerPorId(publicacionId);
      if (!publicacion) {
        return { success: false, message: "Publicacion no encontrada" };
      }

      if (publicacion.usuarioId !== usuarioId) {
        return { success: false, message: "Solo el propietario puede cambiar el estado" };
      }

      if (!this.validarTransicionEstado(publicacion.estado, nuevoEstado)) {
        return { success: false, message: "Transicion de estado no permitida" };
      }

      await PublicacionRepositorio.actualizarEstado(publicacionId, nuevoEstado);
      return { success: true, message: "Estado actualizado correctamente 👍" };

    } catch {
      return { success: false, message: "Error interno del servidor" };
    }
  }

  private validarTransicionEstado(estadoActual: string, nuevoEstado: string): boolean {
    const transicionesPermitidas: Record<string, string[]> = {
      activa: ["pausada", "eliminada"],
      pausada: ["activa", "eliminada"],
      eliminada: []
    };
    return transicionesPermitidas[estadoActual]?.includes(nuevoEstado) || false;
  }

  async traerPaginadas(limit: number, startAfterId?: string) {
    const { publicaciones, ultId } =
      await PublicacionRepositorio.traerPaginadas(limit, startAfterId);

    return {
      publicaciones: publicaciones.map(p => pasarADtoMin(p)),
      ultId
    };
  }

  async actualizar(idUsuario: string, idPublicacion: string, datos: Partial<Publicacion>) {
    await PublicacionRepositorio.actualizar(idUsuario, idPublicacion, datos);
  }

  async eliminar(id: string, usuarioId: string) {
    const publicacion = await PublicacionRepositorio.obtenerPorId(id);
    if (!publicacion) throw new AppError("Publicacion no encontrada", 404);

    const administrador = await esAdmin(usuarioId);
    if (!administrador) {
      throw new AppError("No tenes permiso para eliminar esta publicacion", 403);
    }

    await PublicacionRepositorio.eliminar(id);
  }

  async eliminarPorUsuario(usuarioId: string) {
    await PublicacionRepositorio.eliminarPorUsuario(usuarioId);
    await UsuarioRepositorio.eliminar(usuarioId);
  }

  async eliminarSoft(id: string, usuarioId: string) {
    const publicacion = await PublicacionRepositorio.obtenerPorId(id);
    if (!publicacion) throw new AppError("Publicacion no encontrada", 404);

    if (publicacion.usuarioId !== usuarioId) {
      throw new AppError("No tenes permiso para eliminar esta publicacion", 403);
    }

    await PublicacionRepositorio.actualizarEstado(id, "eliminada");
  }

  async restaurar(id: string, usuarioId: string) {
    const administrador = await esAdmin(usuarioId);
    if (!administrador) {
      throw new AppError("Solo administradores pueden restaurar", 403);
    }

    const publicacion = await PublicacionRepositorio.obtenerPorId(id);
    if (!publicacion) throw new AppError("Publicacion no encontrada", 404);

    if (publicacion.estado !== "eliminada") {
      throw new AppError("La publicacion no esta eliminada", 400);
    }

    await PublicacionRepositorio.actualizarEstado(id, "activa");
  }

  async obtenerEliminadas(usuarioId: string): Promise<PublicacionDto[]> {
    const administrador = await esAdmin(usuarioId);
    if (!administrador) {
      throw new AppError("Solo administradores pueden ver eliminadas", 403);
    }

    const publicaciones = await PublicacionRepositorio.obtenerEliminadas();
    return publicaciones.map(p => pasarADto(p));
  }

  async buscar(texto: string): Promise<PublicacionDto[]> {
    const publicaciones = await PublicacionRepositorio.buscar(texto);
    return publicaciones.map(p => pasarADto(p));
  }

  async buscarConFiltros(filtros: FiltrosBusqueda): Promise<PublicacionDto[]> {
    const publicaciones = await PublicacionRepositorio.buscarConFiltros(filtros);
    if (!publicaciones.length) {
      throw new AppError("No se encontraron publicaciones con esos filtros.", 404);
    }
    return publicaciones.map(p => pasarADto(p));
  }
}
