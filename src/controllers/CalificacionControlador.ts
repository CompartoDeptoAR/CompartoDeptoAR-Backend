import { Request, Response } from "express";
import { CalificacionServicio } from "../services/CalificacionServicio";
import { RequestConUsuarioId } from "../middlewares/validarUsuarioRegistrado";

export class CalificacionController {

  static async crear(req: RequestConUsuarioId, res: Response): Promise<Response> {
    try {
      const idCalificador = req.usuarioId!;
      const { idCalificado, puntuacion, comentario, nombreCalificador } = req.body;

      const { mensaje, promedio } = await CalificacionServicio.crearCalificacion(
        idCalificador,
        idCalificado,
        puntuacion,
        comentario,
        nombreCalificador
      );

      return res.status(201).json({
        mensaje,
        promedio
      });
    } catch (err: any) {
      return res
        .status(err.status || 500)
        .json({ error: err.message || "Error al crear la calificacion" });
    }
  }

  static async obtenerPorUsuario(req: Request, res: Response): Promise<Response> {
    try {
      const { idUsuario } = req.params;
      const resultado = await CalificacionServicio.obtenerCalificaciones(idUsuario!);

      if (!resultado.calificaciones.length) {
        return res.status(200).json({
          promedio: 0,
          mensaje: "Este usuario todavia no se califico 👎."
        });
      }

      return res.status(200).json(resultado);
    } catch (err: any) {
      return res
        .status(err.status || 500)
        .json({ error: err.message || "Error al obtener calificaciones" });
    }
  }
}