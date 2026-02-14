import { Request, Response } from "express";
import { ReporteServicio} from "../services/ReporteServicio";
import { enviarCorreoReporteUsuario } from  "../helpers/Correo";
import { UsuarioServicio } from "../services/UsuarioServicio";

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

    let nombreReportante = "Usuario desconocido";

    if (reportanteId) {
      try {
        const usuario = await UsuarioServicio.obtenerUsuarioPorId(reportanteId);
        nombreReportante = usuario.perfil.nombreCompleto;
      } catch (error) {
        console.error("No se pudo obtener el usuario:", error);
      }
    }

    enviarCorreoReporteUsuario(
      nombreReportante,
      idContenido,
      tipo,
      motivo,
      descripcion
    ).catch(err => {
      console.error("Error enviando mail:", err);
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