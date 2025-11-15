import { FiltrosBusqueda, Publicacion } from "../models/Publcacion";
import { pasarADto, pasarADtoMin, pasarAModelo, PublicacionDto, PublicacionMinDto } from "../dtos/publicacionesDto";
import { PublicacionRepositorio } from "../repository/PublicacionRepositorio";

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
      publicaciones: publicaciones.map(p => pasarADto(p))
    };
  }

  static async obtenerPorId(id: string): Promise<Publicacion | null> {
    if (!id) throw new Error("ID invalido");
    const publicacion = await PublicacionRepositorio.obtenerPorId(id);
    return publicacion;
  }

async traerPaginadas(limit: number,startAfterId?: string): Promise<{ publicaciones: PublicacionMinDto[], lastId?: string | undefined }> {
  const { publicaciones, lastId } = await PublicacionRepositorio.traerPaginadas(limit, startAfterId);
  return {
    publicaciones: publicaciones.map(p => pasarADtoMin(p)),
    lastId
  };
}


  async actualizar(idUsuario: string, idPublicacion: string, datos: Partial<Publicacion>): Promise<void> {
    await PublicacionRepositorio.actualizar(idUsuario, idPublicacion, datos);
  }

  async eliminar(id: string): Promise<void> {
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