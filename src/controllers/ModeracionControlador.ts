import { Request, Response } from "express";
import { ModeracionServicio } from "../services/ModeracionServicio";
import { RequestConUsuarioId } from "../middlewares/validarUsuarioRegistrado";
import { TipoRol } from "../models/tipoRol";
import { UsuarioRepositorio } from "../repository/UsuarioRepositorio";

//tengo que pasarla a helpers
function esAdmin(usuarioId?: string) {
  if (!usuarioId) return false;
  return UsuarioRepositorio.buscarPorId(usuarioId).then(u => {
    if (!u) return false;
    return Array.isArray(u.rol) && u.rol.some(r => r.rolId === TipoRol.ADMIN_ROLE);
  });
}

export class ModeracionController {
  static async listarReportes(req: RequestConUsuarioId, res: Response): Promise<Response> {
    try {
      const isAdmin = await esAdmin(req.usuarioId!);
      if (!isAdmin) return res.status(403).json({ error: "Acceso denegado" });

      const reportes = await ModeracionServicio.listarReportes();
      return res.status(200).json(reportes);
    } catch (err: any) {
      return res.status(err.status || 500).json({ error: err.message || "Error listando reportes" });
    }
  }

  static async revisarReporte(req: RequestConUsuarioId, res: Response): Promise<Response> {
    try {
      const isAdmin = await esAdmin(req.usuarioId!);
      if (!isAdmin) return res.status(403).json({ error: "Acceso denegado" });

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
      if (!isAdmin) return res.status(403).json({ error: "Acceso denegado" });

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
      if (!isAdmin) return res.status(403).json({ error: "Acceso denegado" });

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
