import { Reporte } from "../models/Reporte";
import { ReporteRepositorio } from "../repository/ReporteRepositorio";

export class ReporteServicio {
  static async crearReporte(data: Omit<Reporte, "id">): Promise<string> {
    return await ReporteRepositorio.guardar(data);
  }

  static async obtenerReporte(id: string): Promise<Reporte | null> {
    return await ReporteRepositorio.obtenerPorId(id);
  }
}
