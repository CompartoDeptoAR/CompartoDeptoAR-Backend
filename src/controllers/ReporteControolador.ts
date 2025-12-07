import { Request, Response } from "express";
import { ReporteServicio } from "../services/ReporteServicio";

export class ReporteController {

  static async crear(req: Request, res: Response): Promise<Response> {
      try {
        const id = await ReporteServicio.crearReporte(req.body);
        return res.status(201).json({
          mensaje: "Mensaje enviado correctamente. Te contactaremos pronto 👍",
        });
      } catch (err: any) {

        return res.status(500).json({
          error: err.message || "Error enviando contacto"
      })
    }
  }

  static async obtener(req: Request, res: Response): Promise<void> {
    try {
      const reporte = await ReporteServicio.obtenerReporte(req.params.id!);
      if (!reporte)  res.status(404).json({ error: "Reporte no encontrado" });
      res.status(200).json(reporte);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}