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
    return await FavoritoRepositorio.obtenerPublicacionesFavoritas(usuarioId);
  }

  static async esFavorito(usuarioId: string, publicacionId: string): Promise<boolean> {
    return await FavoritoRepositorio.esFavorito(usuarioId, publicacionId);
  }

  static async obtenerIdsFavoritas(usuarioId: string): Promise<string[]> {
    return await FavoritoRepositorio.obtenerIdsFavoritas(usuarioId);
  }
}