import { Request, Response } from "express";
import { CalificacionServicio } from "../services/CalificacionServicio";
import { RequestConUsuarioId } from "../middlewares/validarUsuarioRegistrado";

export class CalificacionController {

  static async crear(req: RequestConUsuarioId, res: Response): Promise<Response> {
    try {
      const idCalificador = req.usuarioId!;

      console.log("ID del calificador recibido:", req.usuarioId);
      const { idCalificado, puntuacion, comentario, nombreCalificador } = req.body;
      const mensaje = await CalificacionServicio.crearCalificacion(
        idCalificador,
        idCalificado,
        puntuacion,
        comentario,
        nombreCalificador
      );
      return res.status(201).json({ mensaje });
    } catch (err: any) {
      return res.status(err.status || 500).json({ error: err.message || "Error al crear la calificacion" });
    }
  }

  static async obtenerPorUsuario(req: Request, res: Response): Promise<Response> {
    try {
      const idUsuario = req.params.idUsuario;
      const resultado = await CalificacionServicio.obtenerCalificaciones(idUsuario!);
      return res.status(200).json(resultado);
    } catch (err: any) {
      return res.status(err.status || 500).json({ error: err.message || "Error al obtener calificaciones" });
    }
  }
}
