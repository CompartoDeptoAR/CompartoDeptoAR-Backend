import { Request, Response } from "express";
import { FavoritoService } from "../services/FavoritosServicio";
import { RequestConUsuarioId } from "../middlewares/validarUsuarioRegistrado";

export class FavoritoController {


  static async agregar(req: RequestConUsuarioId, res: Response): Promise<Response> {
    try {
      const usuarioId = req.usuarioId;
      const { publicacionId } = req.body;

      if (!usuarioId) {
        return res.status(401).json({ error: "Token invalido" });
      }

      if (!publicacionId) {
        return res.status(400).json({ error: "Falta el ID de la publicacion" });
      }

      const nuevoFavorito = await FavoritoService.agregarFavorito(usuarioId, publicacionId);

      return res.status(201).json({
        mensaje: "Publicacion agregada a tus favoritos 😎",
        favorito: nuevoFavorito,
      });
    } catch (err: any) {
      return res.status(err.status || 500).json({
        error: err.message || "Error interno del servidor",
      });
    }
  }


  static async eliminar(req: RequestConUsuarioId, res: Response): Promise<Response> {
    try {
      const usuarioId = req.usuarioId;
      const { publicacionId } = req.params;

      if (!usuarioId) {
        return res.status(401).json({ error: "Token invalido" });
      }

      if (!publicacionId) {
        return res.status(400).json({ error: "Falta el ID de la publicacion 😒" });
      }

      await FavoritoService.eliminarFavorito(usuarioId, publicacionId);

      return res.json({ mensaje: "Publicacion eliminada de tus favoritos." });
    } catch (err: any) {
      return res.status(err.status || 500).json({
        error: err.message || "Error interno del servidor",
      });
    }
  }

  static async listarFavoritos(req: RequestConUsuarioId, res: Response): Promise<Response> {
    try {
      const usuarioId = req.usuarioId;

      if (!usuarioId) {
        return res.status(401).json({ error: "Token inválido" });
      }

      const publicacionesFavoritas = await FavoritoService.obtenerFavoritos(usuarioId);

      return res.status(200).json({
        mensaje: "Publicaciones favoritas ❤:",
        publicaciones: publicacionesFavoritas
      });

    } catch (err: any) {
      return res.status(err.status || 500).json({
        error: err.message || "Error interno del servidor",
      });
    }
  }
}
