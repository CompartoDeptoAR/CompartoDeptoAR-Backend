import { Request, Response } from "express";
import { ReporteServicio } from "../services/ReporteServicio";

export class ReporteController {

  static async crear(req: Request, res: Response) {
    try {
      const id = await ReporteServicio.crearReporte(req.body);
      res.status(201).json({ id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async obtener(req: Request, res: Response) {
    try {
      const reporte = await ReporteServicio.obtenerReporte(req.params.id!);
      if (!reporte) return res.status(404).json({ error: "Reporte no encontrado" });

      res.status(200).json(reporte);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async listar(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 200;
      const reportes = await ReporteServicio.listar(limit);
      res.status(200).json(reportes);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async marcarRevisado(req: Request, res: Response) {
    try {
      const { adminId, accionTomada, motivoEliminacion } = req.body;

      await ReporteServicio.marcarRevisado(
        req.params.id!,
        adminId,
        accionTomada,
        motivoEliminacion
      );

      res.status(200).json({ mensaje: "Reporte marcado como revisado" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
