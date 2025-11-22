import { FavoritoRepositorio } from "../repository/FavoritosRepositorio";
import { Favorito } from "../models/Favorito";
import { PublicacionMinDto } from "../dtos/publicacionesDto";

export class FavoritoService {

  static async agregarFavorito(usuarioId: string, publicacionId: string): Promise<Favorito> {
    return await FavoritoRepositorio.agregar(usuarioId, publicacionId);
  }

  static async eliminarFavorito(usuarioId: string, publicacionId: string): Promise<void> {
    return await FavoritoRepositorio.eliminar(usuarioId, publicacionId);
  }

  static async obtenerFavoritos(usuarioId: string): Promise<PublicacionMinDto[]> {
      const publicaciones = await FavoritoRepositorio.obtenerPublicacionesFavoritas(usuarioId);

      return publicaciones.map(pub => ({
        id: pub.id,
        titulo: pub.titulo,
        ubicacion: pub.ubicacion,
        precio: pub.precio,
        foto: pub.foto ?? []
      }));
    }
}
