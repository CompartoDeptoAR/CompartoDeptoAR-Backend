import { ReporteRepositorio } from "../repository/ReporteRepositorio";
import { PublicacionRepositorio } from "../repository/PublicacionRepositorio";
import mensajeRepositorio from "../repository/MensajeRepositorio";
import { AuditoriaRepositorio } from "../repository/AuditoriaRepositorio";
import { UsuarioRepositorio } from "../repository/UsuarioRepositorio";
import { enviarCorreoEliminacionContenido } from "../helpers/Correo";


export class ModeracionServicio {

  static async listarReportes(): Promise<any[]> {
    return await ReporteRepositorio.listarTodos();
  }

  static async revisarReporte(
    reporteId: string,
    adminId: string,
    accion: "dejado" | "eliminado",
    motivoEliminacion?: string
  ): Promise<{ mensaje: string }> {

    const reporte = await ReporteRepositorio.obtenerPorId(reporteId);
    if (!reporte) throw { status: 404, message: "Reporte no encontrado" };

    if (reporte.tipo === "publicacion") {
      const publicacion = await PublicacionRepositorio.obtenerPorId(reporte.idContenido);
      if (!publicacion) {
        await ReporteRepositorio.marcarRevisado(reporteId, adminId, "dejado");
        await AuditoriaRepositorio.registrar({
          adminId,
          accion: "revisar_publicacion_no_disponible",
          detalles: { reporteId, idContenido: reporte.idContenido },
          fecha: undefined as any
        });
        return { mensaje: "El contenido ya no esta disponible." };
      }
    } else if (reporte.tipo === "mensaje") {
      const mensaje = await mensajeRepositorio.obtenerPorId(reporte.idContenido);
      if (!mensaje) {
        await ReporteRepositorio.marcarRevisado(reporteId, adminId, "dejado");
        await AuditoriaRepositorio.registrar({
          adminId,
          accion: "revisar_mensaje_no_disponible",
          detalles: { reporteId, idContenido: reporte.idContenido },
          fecha: undefined as any
        });
        return { mensaje: "El contenido ya no esta disponible." };
      }
    }

    if (accion === "eliminado") {
      if (reporte.tipo === "publicacion") {
        if (typeof PublicacionRepositorio.marcarComoEliminada === "function") {
          await PublicacionRepositorio.marcarComoEliminada(reporte.idContenido);
        } else {
          await PublicacionRepositorio.eliminar(reporte.idContenido);
        }

        const publicacion = await PublicacionRepositorio.obtenerPorId(reporte.idContenido);
        if (publicacion) {
          const autor = await UsuarioRepositorio.buscarPorId(publicacion.usuarioId);
          if (autor && autor.correo) {
            await enviarCorreoEliminacionContenido(autor.correo, motivoEliminacion ?? "Infracción de normas", "publicación");
          }
        }

        await AuditoriaRepositorio.registrar({
          adminId,
          accion: "eliminar_publicacion",
          detalles: { reporteId, idContenido: reporte.idContenido, motivo: motivoEliminacion ?? null },
          fecha: undefined as any
        });

      } else {
        await mensajeRepositorio.eliminarMensaje(reporte.idContenido);

        const mensaje = await mensajeRepositorio.obtenerPorId(reporte.idContenido);
        if (mensaje) {
          const autor = await UsuarioRepositorio.buscarPorId(mensaje.idRemitente);
          if (autor && autor.correo) {
            await enviarCorreoEliminacionContenido(autor.correo, motivoEliminacion ?? "Infracción de normas", "mensaje");
          }
        }

        await AuditoriaRepositorio.registrar({
          adminId,
          accion: "eliminar_mensaje",
          detalles: { reporteId, idContenido: reporte.idContenido, motivo: motivoEliminacion ?? null },
          fecha: undefined as any
        });
      }
    } else {
      await AuditoriaRepositorio.registrar({
        adminId,
        accion: "marcar_dejado",
        detalles: { reporteId, idContenido: reporte.idContenido },
        fecha: undefined as any
      });
    }
    await ReporteRepositorio.marcarRevisado(reporteId, adminId, accion, motivoEliminacion ?? null);

    return { mensaje: `Reporte ${accion} correctamente y registrado en auditoría.` };
  }


  static async eliminarPublicacionDirecta(publicacionId: string, adminId: string, motivo?: string): Promise<void> {

    if (typeof PublicacionRepositorio.marcarComoEliminada === "function") {
      await PublicacionRepositorio.marcarComoEliminada(publicacionId);
    } else {
      await PublicacionRepositorio.eliminar(publicacionId);
    }

    const publicacion = await PublicacionRepositorio.obtenerPorId(publicacionId);
    if (publicacion) {
      const autor = await UsuarioRepositorio.buscarPorId(publicacion.usuarioId);
      if (autor && autor.correo) {
        await enviarCorreoEliminacionContenido(autor.correo, motivo ?? "Infracción de normas", "publicación");
      }
    }

    await AuditoriaRepositorio.registrar({
      adminId,
      accion: "eliminar_publicacion",
      detalles: { idContenido: publicacionId, motivo: motivo ?? null },
      fecha: undefined as any
    });
  }


  static async eliminarMensajeDirecto(mensajeId: string, adminId: string, motivo?: string): Promise<void> {
    await mensajeRepositorio.eliminarMensaje(mensajeId);

    const mensaje = await mensajeRepositorio.obtenerPorId(mensajeId);
    if (mensaje) {
      const autor = await UsuarioRepositorio.buscarPorId(mensaje.idRemitente);
      if (autor && autor.correo) {
        await enviarCorreoEliminacionContenido(autor.correo, motivo ?? "Infracción de normas", "mensaje");
      }
    }

    await AuditoriaRepositorio.registrar({
      adminId,
      accion: "eliminar_mensaje",
      detalles: { idContenido: mensajeId, motivo: motivo ?? null },
      fecha: undefined as any
    });
  }
}
