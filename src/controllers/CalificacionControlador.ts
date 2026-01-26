import { Request, Response } from "express";
import { CalificacionServicio } from "../services/CalificacionServicio";
import { RequestConUsuarioId } from "../middlewares/validarUsuarioRegistrado";
import { AppError } from "../error/AppError";

export class CalificacionController {

  static async crear(req: RequestConUsuarioId, res: Response): Promise<void> {
    const idCalificador = req.usuarioId;
    if (!idCalificador) {
      throw new AppError("Usuario no autenticado", 401);
    }

    const { idCalificado, puntuacion, comentario, nombreCalificador } = req.body;

    const { mensaje, promedio } = await CalificacionServicio.crearCalificacion(
      idCalificador,
      idCalificado,
      puntuacion,
      comentario,
      nombreCalificador
    );

    res.status(201).json({
      mensaje,
      promedio
    });
  }

  static async obtenerPorUsuario(req: Request, res: Response): Promise<void> {
    const { idUsuario } = req.params;
    console.log(`obtenerPorUsuario - idUsuario recibido: ${idUsuario}`);

    const resultado = await CalificacionServicio.obtenerCalificaciones(idUsuario!);
    console.log(`Calificaciones obtenidas:`, resultado);

    if (!resultado.calificaciones.length) {
      res.status(200).json({
        promedio: 0,
        cantidad: 0,
        calificaciones: [],
        mensaje: "Este usuario todavia no se califico 👎."
      });
      return;
    }

    res.status(200).json(resultado);
  }

  static async obtenerPromedio(req: Request, res: Response): Promise<void> {
    const { idUsuario } = req.params;
    console.log(`obtenerPromedio - idUsuario recibido: ${idUsuario}`);

    const { promedio, cantidad } = await CalificacionServicio.obtenerSoloPromedio(idUsuario!);
    console.log(`Promedio calculado - promedio: ${promedio}, cantidad: ${cantidad}`);

    res.status(200).json({
      promedio,
      cantidad
    });
  }
}