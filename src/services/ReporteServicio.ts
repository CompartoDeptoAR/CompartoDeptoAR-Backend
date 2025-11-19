import { Reporte } from "../models/Reporte";
import { ReporteRepositorio } from "../repository/ReporteRepositorio";

export class ReporteServicio {

  static async crearReporte(data: Omit<Reporte, "id">): Promise<string> {
    return await ReporteRepositorio.guardar(data);
  }


  static async obtenerReporte(id: string): Promise<Reporte | null> {
    return await ReporteRepositorio.obtenerPorId(id);
  }

  //para admins
  static async listar(limit = 200): Promise<Reporte[]> {
    return await ReporteRepositorio.listarTodos(limit);
  }


  static async marcarRevisado(
    id: string,
    adminId: string,
    accion: "dejado" | "eliminado" | null,
    motivoEliminacion?: string | null
  ): Promise<void> {
    await ReporteRepositorio.marcarRevisado(id, adminId, accion, motivoEliminacion);
  }
}
