import { db } from "../config/firebase";
import { Timestamp } from "firebase-admin/firestore";
import { MiniReporte, Reporte } from "../models/Reporte";
import { Publicacion } from "../models/Publcacion";
import { Mensaje } from "../models/Mensaje";
import { UsuarioConId } from "../models/Usuario";
import { AppError } from "../error/AppError";

export class ModeracionRepositorio {

  static async obtenerReporteConContenido(reporteId: string): Promise<{reporte: Reporte | null; contenido: Publicacion | Mensaje | null; tipo: "publicacion" | "mensaje" | null;}> {
    const reporteDoc = await db.collection("reportes").doc(reporteId).get();

    if (!reporteDoc.exists) {
      return { reporte: null, contenido: null, tipo: null };
    }

    const reporte = { id: reporteDoc.id, ...reporteDoc.data() } as Reporte;
    let contenido: Publicacion | Mensaje | null = null;

    if (reporte.tipo === "publicacion") {
      const publicacionDoc = await db.collection("publicaciones").doc(reporte.idContenido).get();
      if (publicacionDoc.exists) {
        contenido = { id: publicacionDoc.id, ...publicacionDoc.data() } as Publicacion;
      }
    } else if (reporte.tipo === "mensaje") {
      const mensajeDoc = await db.collection("mensajes").doc(reporte.idContenido).get();
      if (mensajeDoc.exists) {
        contenido = { id: mensajeDoc.id, ...mensajeDoc.data() } as Mensaje;
      }
    }

    return { reporte, contenido, tipo: reporte.tipo };
  }

  static async listarTodosReportes(limit: number = 100): Promise<MiniReporte[]> {
    const snapshot = await db.collection("reportes").orderBy("fechaReporte", "desc").limit(limit).get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        tipo: data.tipo,
        motivo: data.motivo,
        fechaReporte: data.fechaReporte,
        revisado: data.revisado ?? false,
        descripcion: data.descripcion ?? "No se pudo leer la descripcion",
        idContenido: data.idContenido,
      } as MiniReporte;
    });
  }

  static async marcarRevisado(reporteId: string, adminId: string,accion: string, motivo?: string): Promise<void> {
    await db.collection("reportes").doc(reporteId).update({
      revisado: true,
      revisadoPor: adminId,
      accionTomada: accion,
      motivoEliminacion: motivo || null,
      fechaRevision: new Date()
    });
  }

  static async obtenerAutorDeContenido(tipo: "publicacion" | "mensaje",idContenido: string): Promise<UsuarioConId | null> {
    try {
      if (tipo === "publicacion") {
        const publicacionDoc = await db.collection("publicaciones").doc(idContenido).get();
        if (!publicacionDoc.exists) return null;

        const publicacion = publicacionDoc.data() as Publicacion;
        const usuarioDoc = await db.collection("usuarios").doc(publicacion.usuarioId).get();

        return usuarioDoc.exists
          ? { id: usuarioDoc.id, ...usuarioDoc.data() } as UsuarioConId
          : null;
      } else {
        const mensajeDoc = await db.collection("mensajes").doc(idContenido).get();
        if (!mensajeDoc.exists) return null;

        const mensaje = mensajeDoc.data() as Mensaje;
        const usuarioDoc = await db.collection("usuarios").doc(mensaje.idRemitente).get();

        return usuarioDoc.exists
          ? { id: usuarioDoc.id, ...usuarioDoc.data() } as UsuarioConId
          : null;
      }
    } catch (error) {
      console.error("Error en obtenerAutorDeContenido:", error);
      throw new AppError("Error al obtener autor del contenido", 500);
    }
  }

  static async eliminarContenidoReportado(tipo: "publicacion" | "mensaje",idContenido: string): Promise<void> {
    try {
      if (tipo === "publicacion") {
        await db.collection("publicaciones").doc(idContenido).update({
          estado: "eliminada",
          updatedAt: Timestamp.now()
        });
      } else {
        await db.collection("mensajes").doc(idContenido).delete();
      }
    } catch (error) {
      //console.error("Error en eliminarContenidoReportado:", error);
      throw new AppError("Error al eliminar contenido reportado", 500);
    }
  }

  static async verificarContenidoExiste(tipo: "publicacion" | "mensaje", idContenido: string): Promise<boolean> {
    try {
      if (tipo === "publicacion") {
        const doc = await db.collection("publicaciones").doc(idContenido).get();
        return doc.exists;
      } else {
        const doc = await db.collection("mensajes").doc(idContenido).get();
        return doc.exists;
      }
    } catch (error) {
      //console.error("Error en verificarContenidoExiste:", error);
      return false;
    }
  }

  static async obtenerEstadisticasModeracion(): Promise<{totalReportes: number; reportesPendientes: number;reportesRevisados: number;publicacionesEliminadas: number; mensajesEliminados: number;}> {
    try {
      const todosReportes = await db.collection("reportes").get();
      const totalReportes = todosReportes.size;

      const reportesPendientesSnap = await db.collection("reportes").where("revisado", "==", false).get();
      const reportesPendientes = reportesPendientesSnap.size;

      const reportesRevisadosSnap = await db.collection("reportes").where("revisado", "==", true).get();
      const reportesRevisados = reportesRevisadosSnap.size;

      const publicacionesEliminadasSnap = await db.collection("publicaciones").where("estado", "==", "eliminada").get();
      const publicacionesEliminadas = publicacionesEliminadasSnap.size;

      const mensajesEliminados = 0; // Por ahora, lo dejo asi

      return {
        totalReportes,
        reportesPendientes,
        reportesRevisados,
        publicacionesEliminadas,
        mensajesEliminados
      };
    } catch (error) {
      console.error("Error en obtenerEstadisticasModeracion:", error);
      throw new AppError("Error al obtener estadísticas de moderación", 500);
    }
  }

  static async obtenerReportesRecientes(limit: number = 50): Promise<Reporte[]> {
    try {
      const snapshot = await db.collection("reportes").orderBy("fechaReporte", "desc").limit(limit).get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Reporte));
    } catch (error) {
      console.error("Error en obtenerReportesRecientes:", error);
      throw new AppError("Error al obtener reportes recientes", 500);
    }
  }
}