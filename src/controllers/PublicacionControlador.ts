import { Request, Response } from "express";
import { PublicacionServicio } from "../services/PublicacionServicio";
import { RequestConUsuarioId } from "../middlewares/validarUsuarioRegistrado";

const publicacionServicio = new PublicacionServicio();

export class PublicacionController {

  static async crear(req: RequestConUsuarioId, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuarioId;
      if (!usuarioId) {
        res.status(401).json({ error: "Usuario no autenticado" });
        return;
      }
      const datos = { ...req.body, usuarioId };
      const publicacionDto = await publicacionServicio.crear(datos);

      res.status(201).json({
        mensaje: "Publicacion creada 👌",
        publicacion: publicacionDto,
      });

    } catch (err: any) {
      res.status(err.status || 500).json({ error: err.message || "Error interno" });
    }
  }

  static async misPublicaciones(req: RequestConUsuarioId, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuarioId;

      if (!usuarioId) {
        res.status(401).json({ error: "Usuario no autenticado" });
        return;
      }

      const misPublicaciones = await publicacionServicio.misPublicaciones(String(usuarioId));
      res.status(200).json(misPublicaciones);

    } catch (err: any) {
      res.status(err.status || 500).json({ error: err.message || "Error interno" });
    }
  }

  static async traerTodas(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const startAfterId = req.query.startAfterId as string | undefined;

      const resultado = await publicacionServicio.traerPaginadas(limit, startAfterId);
      res.status(200).json(resultado);

    } catch (err: any) {
      res.status(err.status || 500).json({ error: err.message || "Error interno" });
    }
  }

  static async obtenerPorId(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const publicacion = await PublicacionServicio.obtenerPorId(id!);

      if (!publicacion) {
        res.status(404).json({ error: `No se encontro la publicacion con ID: ${id}` });
        return;
      }

      res.json(publicacion);

    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async actualizar(req: RequestConUsuarioId, res: Response): Promise<void> {
    try {
      const idUsuario = req.usuarioId;
      const idPublicacion = String(req.params.idPublicacion);
      const datos = req.body;

      if (!idUsuario) {
        res.status(401).json({ error: "Usuario no loggeado" });
        return;
      }

      await publicacionServicio.actualizar(idUsuario, idPublicacion, datos);
      res.status(200).json({ mensaje: "Publicacion actualizada 👌" });

    } catch (err: any) {
      res.status(err.status || 500).json({ error: err.message || "Error interno" });
    }
  }

  static async eliminar(req: RequestConUsuarioId, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const usuarioId = req.usuarioId!;

      await publicacionServicio.eliminar(id, usuarioId);
      res.status(200).json({ mensaje: "Publicacion eliminada 👌" });

    } catch (err: any) {
      res.status(err.status || 500).json({ error: err.message || "Error interno" });
    }
  }

  static async buscar(req: Request, res: Response): Promise<void> {
    try {
      const texto = req.query.texto as string;

      if (!texto) {
        res.status(400).json({ mensaje: "Falta el texto para buscar" });
        return;
      }

      const publicaciones = await publicacionServicio.buscar(texto);
      res.json(publicaciones);

    } catch (error: any) {
      console.error("Error buscando publicaciones:", error);

      if (error.status && error.message) {
        res.status(error.status).json({ mensaje: error.message });
        return;
      }

      res.status(500).json({ mensaje: "Error interno en el servidor" });
    }
  }

  static async buscarConFiltros(req: Request, res: Response): Promise<void> {
    try {
      const filtros = req.body;
      const publicaciones = await publicacionServicio.buscarConFiltros(filtros);
      res.status(200).json(publicaciones);

    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message || "Error al buscar publicaciones" });
    }
  }
}