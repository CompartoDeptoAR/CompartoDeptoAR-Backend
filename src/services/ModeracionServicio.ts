import { Timestamp } from 'firebase-admin/firestore';
import { ModeracionRepositorio } from '../repository/ModeracionRepositorio';
import { AuditoriaRepositorio } from '../repository/AuditoriaRepositorio';
import { enviarCorreoEliminacionContenido } from '../helpers/Correo';
import { MiniReporte } from 'src/models/Reporte';
import { AppError } from '../error/AppError';

export class ModeracionServicio {

  static async listarReportes(limit: number = 100): Promise<MiniReporte[]> {
    return await ModeracionRepositorio.listarTodosReportes(limit);
  }

  static async revisarReporte(reporteId: string,adminId: string,accion: "dejado" | "eliminado", motivoEliminacion?: string ): Promise<{ mensaje: string }> {

    const { reporte, contenido, tipo } = await ModeracionRepositorio.obtenerReporteConContenido(reporteId);

    if (!reporte) {
      throw new AppError("Reporte no encontrado", 404);
    }

    if (!contenido) {
      await ModeracionRepositorio.marcarRevisado(reporteId, adminId, "dejado");
      await AuditoriaRepositorio.registrar({
        adminId,
        accion: `revisar_${tipo}_no_disponible`,
        detalles: { reporteId, idContenido: reporte.idContenido },
        fecha: Timestamp.now()
      });

      return { mensaje: "El contenido ya no esta disponible." };
    }

    if (accion === "eliminado") {
      await this.procesarEliminacionContenido(
        tipo!,
        reporte.idContenido,
        adminId,
        motivoEliminacion,
        reporteId
      );
    } else {
      await AuditoriaRepositorio.registrar({
        adminId,
        accion: "marcar_dejado",
        detalles: { reporteId, idContenido: reporte.idContenido },
        fecha: Timestamp.now()
      });
    }

    await ModeracionRepositorio.marcarRevisado(
      reporteId,
      adminId,
      accion,
      motivoEliminacion
    );

    return {
      mensaje: `Reporte ${accion} 👌 y registrado en auditoria.`
    };
  }

  private static async procesarEliminacionContenido(tipo: "publicacion" | "mensaje",idContenido: string,adminId: string,motivoEliminacion: string | undefined,reporteId: string): Promise<void> {

    await ModeracionRepositorio.eliminarContenidoReportado(tipo, idContenido);
    const autor = await ModeracionRepositorio.obtenerAutorDeContenido(tipo, idContenido);

    if (autor && autor.correo) {
      await enviarCorreoEliminacionContenido(
        autor.correo,
        motivoEliminacion ?? "Infraccion de normas",
        tipo === "publicacion" ? "publicación" : "mensaje"
      );
    }

    await AuditoriaRepositorio.registrar({
      adminId,
      accion: `eliminar_${tipo}`,
      detalles: {
        reporteId,
        idContenido,
        motivo: motivoEliminacion ?? null,
        autorId: autor?.id
      },
      fecha: Timestamp.now()
    });
  }

  static async eliminarPublicacionDirecta(publicacionId: string,adminId: string, motivo?: string): Promise<void> {

    const existe = await ModeracionRepositorio.verificarContenidoExiste("publicacion", publicacionId);
    if (!existe) {
      throw new AppError("Publicacion no encontrada", 404);
    }

    await ModeracionRepositorio.eliminarContenidoReportado("publicacion", publicacionId);

    const autor = await ModeracionRepositorio.obtenerAutorDeContenido("publicacion", publicacionId);
    if (autor && autor.correo) {
      await enviarCorreoEliminacionContenido(
        autor.correo,
        motivo ?? "Infraccion de normas",
        "publicación"
      );
    }

    await AuditoriaRepositorio.registrar({
      adminId,
      accion: "eliminar_publicacion",
      detalles: {
        idContenido: publicacionId,
        motivo: motivo ?? null,
        autorId: autor?.id
      },
      fecha: Timestamp.now()
    });
  }

  static async eliminarMensajeDirecto( mensajeId: string,adminId: string,motivo?: string): Promise<void> {

    const existe = await ModeracionRepositorio.verificarContenidoExiste("mensaje", mensajeId);
    if (!existe) {
      throw new AppError("Mensaje no encontrado", 404);
    }

    await ModeracionRepositorio.eliminarContenidoReportado("mensaje", mensajeId);

    const autor = await ModeracionRepositorio.obtenerAutorDeContenido("mensaje", mensajeId);
    if (autor && autor.correo) {
      await enviarCorreoEliminacionContenido(
        autor.correo,
        motivo ?? "Infraccion de normas",
        "mensaje"
      );
    }

    await AuditoriaRepositorio.registrar({
      adminId,
      accion: "eliminar_mensaje",
      detalles: {
        idContenido: mensajeId,
        motivo: motivo ?? null,
        autorId: autor?.id
      },
      fecha: Timestamp.now()
    });
  }

  static async obtenerEstadisticasModeracion() {
    return await ModeracionRepositorio.obtenerEstadisticasModeracion();
  }

  static async obtenerReportesPendientes() {
    return await ModeracionRepositorio.obtenerReportesRecientes();
  }
}