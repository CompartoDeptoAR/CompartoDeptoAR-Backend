import { Response } from "express";
import { ModeracionServicio } from "../services/ModeracionServicio";
import { RequestConUsuarioId } from "../middlewares/validarUsuarioRegistrado";
import { esAdmin } from "../helpers/AdminValidacion";
import { AppError } from "../error/AppError";

export class ModeracionController {

  static async listarReportes(req: RequestConUsuarioId, res: Response): Promise<void> {
    const usuarioId = req.usuarioId;
    if (!usuarioId) {
      throw new AppError("Usuario no autenticado", 401);
    }

    const isAdmin = await esAdmin(usuarioId);
    if (!isAdmin) {
      throw new AppError("Acceso prohibido", 403);
    }

    const reportes = await ModeracionServicio.listarReportes();
    res.status(200).json(reportes);
  }

  static async revisarReporte(req: RequestConUsuarioId, res: Response): Promise<void> {
    const usuarioId = req.usuarioId;
    if (!usuarioId) {
      throw new AppError("Usuario no autenticado", 401);
    }

    const isAdmin = await esAdmin(usuarioId);
    if (!isAdmin) {
      throw new AppError("Solo administradores", 403);
    }

    const reporteId = req.params.id || req.params.idReporte;
    const { accion, motivo } = req.body;

    if (!reporteId || !accion) {
      throw new AppError("Faltan reporteId o accion", 400);
    }

    if (accion !== "dejado" && accion !== "eliminado") {
      throw new AppError('Acción debe ser "dejado" o "eliminado"', 400);
    }

    const resultado = await ModeracionServicio.revisarReporte(
      reporteId,
      usuarioId,
      accion,
      motivo
    );

    res.status(200).json(resultado);
  }

  static async eliminarPublicacion(req: RequestConUsuarioId, res: Response): Promise<void> {
    const usuarioId = req.usuarioId;
    if (!usuarioId) {
      throw new AppError("Usuario no autenticado", 401);
    }

    const isAdmin = await esAdmin(usuarioId);
    if (!isAdmin) {
      throw new AppError("Acceso prohibido", 403);
    }

    const idPublicacion = req.params.id;
    if (!idPublicacion) {
      throw new AppError("Falta el ID de la publicación", 400);
    }

    const { motivo } = req.body;

    await ModeracionServicio.eliminarPublicacionDirecta(idPublicacion, usuarioId, motivo);
    res.status(200).json({ mensaje: "Publicacion eliminada y autor notificado" });
  }

  static async eliminarMensaje(req: RequestConUsuarioId, res: Response): Promise<void> {
    const usuarioId = req.usuarioId;
    if (!usuarioId) {
      throw new AppError("Usuario no autenticado", 401);
    }

    const isAdmin = await esAdmin(usuarioId);
    if (!isAdmin) {
      throw new AppError("Acceso prohibido", 403);
    }

    const idMensaje = req.params.id;
    if (!idMensaje) {
      throw new AppError("Falta el ID del mensaje", 400);
    }

    const { motivo } = req.body;

    await ModeracionServicio.eliminarMensajeDirecto(idMensaje, usuarioId, motivo);
    res.status(200).json({ mensaje: "Mensaje eliminado y autor notificado" });
  }
}