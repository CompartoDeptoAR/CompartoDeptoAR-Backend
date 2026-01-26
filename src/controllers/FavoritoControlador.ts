import { Request, Response } from "express";
import { FavoritoService } from "../services/FavoritosServicio";
import { RequestConUsuarioId } from "../middlewares/validarUsuarioRegistrado";
import { AppError } from "../error/AppError";

export class FavoritoController {

  static async agregar(req: RequestConUsuarioId, res: Response): Promise<void> {
    const usuarioId = req.usuarioId;
    const { publicacionId } = req.body;

    if (!usuarioId) {
      throw new AppError("Token invalido", 401);
    }

    if (!publicacionId) {
      throw new AppError("Falta el ID de la publicacion", 400);
    }

    const nuevoFavorito = await FavoritoService.agregarFavorito(usuarioId, publicacionId);

    res.status(201).json({
      mensaje: "Publicacion agregada a tus favoritos 😎",
      favorito: nuevoFavorito,
    });
  }

  static async eliminar(req: RequestConUsuarioId, res: Response): Promise<void> {
    const usuarioId = req.usuarioId;
    const { publicacionId } = req.params;

    if (!usuarioId) {
      throw new AppError("Token invalido", 401);
    }

    if (!publicacionId) {
      throw new AppError("Falta el ID de la publicacion 😒", 400);
    }

    await FavoritoService.eliminarFavorito(usuarioId, publicacionId);

    res.json({ mensaje: "Publicacion eliminada de tus favoritos." });
  }

  static async listarFavoritos(req: RequestConUsuarioId, res: Response): Promise<void> {
    const usuarioId = req.usuarioId;

    if (!usuarioId) {
      throw new AppError("Token inválido", 401);
    }

    const publicacionesFavoritas = await FavoritoService.obtenerFavoritos(usuarioId);

    res.status(200).json({
      mensaje: "Publicaciones favoritas ❤:",
      publicaciones: publicacionesFavoritas
    });
  }
}