import { FavoritoRepositorio } from "../repository/FavoritosRepositorio";
import { Favorito } from "../models/Favorito";

export class FavoritoService {

  static async agregarFavorito(usuarioId: string, publicacionId: string): Promise<Favorito> {
    return await FavoritoRepositorio.agregar(usuarioId, publicacionId);
  }

  static async eliminarFavorito(usuarioId: string, publicacionId: string): Promise<void> {
    return await FavoritoRepositorio.eliminar(usuarioId, publicacionId);
  }

  static async obtenerFavoritos(usuarioId: string): Promise<Favorito[]> {
    return await FavoritoRepositorio.obtenerPorUsuario(usuarioId);
  }
}
