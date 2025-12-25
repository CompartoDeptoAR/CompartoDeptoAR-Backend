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
      console.log(`📌 obtenerPorUsuario - idUsuario recibido: ${idUsuario}`);

      const resultado = await CalificacionServicio.obtenerCalificaciones(idUsuario!);
      console.log(`✅ Calificaciones obtenidas:`, resultado);

      if (!resultado.calificaciones.length) {
        return res.status(200).json({
          promedio: 0,
          cantidad: 0,
          calificaciones: [],
          mensaje: "Este usuario todavia no se califico 👎."
        });
      }

      return res.status(200).json(resultado);
    } catch (err: any) {
      console.error(`❌ Error en obtenerPorUsuario:`, err);
      return res
        .status(err.status || 500)
        .json({ error: err.message || "Error al obtener calificaciones" });
    }
  }

  static async obtenerPromedio(req: Request, res: Response): Promise<Response> {
    try {
      const { idUsuario } = req.params;
      console.log(`📌 obtenerPromedio - idUsuario recibido: ${idUsuario}`);

      const { promedio, cantidad } = await CalificacionServicio.obtenerSoloPromedio(idUsuario!);
      console.log(`✅ Promedio calculado - promedio: ${promedio}, cantidad: ${cantidad}`);

      return res.status(200).json({
        promedio,
        cantidad
      });
    } catch (err: any) {
      console.error(`❌ Error en obtenerPromedio:`, err);
      return res
        .status(err.status || 500)
        .json({ error: err.message || "Error al obtener promedio" });
    }
  }

}