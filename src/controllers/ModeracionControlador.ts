import {  Response } from "express";
import { ModeracionServicio } from "../services/ModeracionServicio";
import { RequestConUsuarioId } from "../middlewares/validarUsuarioRegistrado";
import { esAdmin } from "../helpers/AdminValidacion"

//pasar a general el es admin xD

export class ModeracionController {
//seria como un panel de moderacion, quedaria lindo...
  static async listarReportes(req: RequestConUsuarioId, res: Response): Promise<Response> {
    try {
      const isAdmin = await esAdmin(req.usuarioId!);
      if (!isAdmin) return res.status(403).json({ error: "Acceso prohibido 🚨" });
      const reportes = await ModeracionServicio.listarReportes();
      return res.status(200).json(reportes);
    } catch (err: any) {
      return res.status(err.status || 500).json({ error: err.message || "Error listando reportes" });
    }
  }

  static async revisarReporte(req: RequestConUsuarioId, res: Response): Promise<Response> {
    try {
      const isAdmin = await esAdmin(req.usuarioId!);
      if (!isAdmin) return res.status(403).json({ error: "Acceso prohibido 🚨" });

      const adminId = req.usuarioId!;
      const reporteId = req.params.idReporte;
      const { accion, motivo } = req.body;
      const resultado = await ModeracionServicio.revisarReporte(reporteId!, adminId, accion, motivo);
      return res.status(200).json(resultado);
    } catch (err: any) {
      return res.status(err.status || 500).json({ error: err.message || "Error revisando reporte" });
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
      return res.status(err.status || 500).json({ error: err.message || "Error eliminando publicación" });
    }
  }

  static async eliminarMensaje(req: RequestConUsuarioId, res: Response): Promise<Response> {
    try {
      const isAdmin = await esAdmin(req.usuarioId!);
      if (!isAdmin) return res.status(403).json({ error: "Acceso prohibido 🚨" });

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
