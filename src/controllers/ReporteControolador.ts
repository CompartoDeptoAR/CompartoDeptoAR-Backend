import { Request, Response } from "express";
import { ReporteServicio } from "../services/ReporteServicio";
import { enviarCorreoReporteUsuario } from  "../helpers/Correo";

export class ReporteController {

 static async crear(req: Request, res: Response): Promise<Response> {
  try {

    const {
      reportanteId,
      idContenido,
      tipo,
      motivo,
      descripcion
    } = req.body;

    await ReporteServicio.crearReporte(req.body);

    enviarCorreoReporteUsuario(
      reportanteId!,
      idContenido,
      tipo,
      motivo,
      descripcion
    ).catch(err => {
      console.error("Error enviando mail de reporte:", err);
    });

    return res.status(201).json({
      mensaje: "Reporte enviado correctamente 👍",
    });

  } catch (err: any) {
    return res.status(500).json({
      error: err.message || "Error enviando reporte"
    });
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