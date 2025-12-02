import {  Response } from "express";
import { ModeracionServicio } from "../services/ModeracionServicio";
import { RequestConUsuarioId } from "../middlewares/validarUsuarioRegistrado";
import { esAdmin } from "../helpers/AdminValidacion"

export class ModeracionController {
//seria como un panel de moderacion, quedaria lindo...
  static async listarReportes(req: RequestConUsuarioId, res: Response): Promise<Response> {
    try {
      const isAdmin = await esAdmin(req.usuarioId!);
      if (!isAdmin) return res.status(403).json({ error: "Acceso prohibido" });
      const reportes = await ModeracionServicio.listarReportes();
      return res.status(200).json(reportes);
    } catch (err: any) {
      return res.status(err.status || 500).json({ error: err.message || "Error listando reportes" });
    }
  }

  static async revisarReporte(req: RequestConUsuarioId, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuarioId;
      if (!usuarioId) {
        res.status(401).json({ error: "Usuario no autenticado" });
        return;
      }
      const isAdmin = await esAdmin(usuarioId);
      if (!isAdmin) {
        res.status(403).json({ error: "Solo administradores" });
        return;
      }
      const reporteId = req.params.id || req.params.idReporte;
      const { accion, motivo } = req.body;
      if (!reporteId || !accion) {
        res.status(400).json({ error: "Faltan reporteId o accion" });
        return;
      }
      if (accion !== "dejado" && accion !== "eliminado") {
        res.status(400).json({ error: 'Acción debe ser "dejado" o "eliminado"' });
        return;
      }
      const resultado = await ModeracionServicio.revisarReporte(
        reporteId,
        usuarioId,
        accion,
        motivo
      );
      res.status(200).json(resultado);
    } catch (err: any) {
      const status = err.status || 500;
      const mensaje = err.message || "Error revisando reporte";
      res.status(status).json({ error: mensaje });
    }
  }
  static async eliminarPublicacion(req: RequestConUsuarioId, res: Response): Promise<Response> {
    try {
      const isAdmin = await esAdmin(req.usuarioId!);
      if (!isAdmin) return res.status(403).json({ error: "Acceso prohibido 🚨" });

      const adminId = req.usuarioId!;
      const idPublicacion = req.params.id;
      const { motivo } = req.body;
      await ModeracionServicio.eliminarPublicacionDirecta(idPublicacion!, adminId, motivo);
      return res.status(200).json({ mensaje: "Publicacion eliminada y autor notificado" });
    } catch (err: any) {
      return res.status(err.status || 500).json({ error: err.message || "Error eliminando publicacion" });
    }
  }

  static async eliminarMensaje(req: RequestConUsuarioId, res: Response): Promise<Response> {
    try {
      const isAdmin = await esAdmin(req.usuarioId!);
      if (!isAdmin) return res.status(403).json({ error: "Acceso prohibido" });

      const adminId = req.usuarioId!;
      const idMensaje = req.params.id;
      const { motivo } = req.body;
      await ModeracionServicio.eliminarMensajeDirecto(idMensaje!, adminId, motivo);
      return res.status(200).json({ mensaje: "Mensaje eliminado y autor notificado" });
    } catch (err: any) {
      return res.status(err.status || 500).json({ error: err.message || "Error eliminando mensaje" });
    }
  }
}
