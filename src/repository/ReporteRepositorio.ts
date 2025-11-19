import { db } from "../config/firebase";
import { Reporte } from "../models/Reporte";
import { Timestamp } from "firebase-admin/firestore";

const COLECCION = "reportes";

export class ReporteRepositorio {

  static async listarTodos(limit = 200): Promise<Reporte[]> {
    const q = db.collection(COLECCION).orderBy("fechaReporte", "desc").limit(limit);
    const snap = await q.get();
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as Reporte) }));
  }

  static async guardar(reporte: Omit<Reporte, "id">): Promise<string> {
    const docRef = await db.collection(COLECCION).add({
      ...reporte,
      fechaReporte: reporte.fechaReporte ?? Timestamp.now(),
      revisado: reporte.revisado ?? false,
      accionTomada: reporte.accionTomada ?? null,
      adminId: reporte.adminId ?? null,
      motivoEliminacion: reporte.motivoEliminacion ?? null,
    });
    await docRef.update({ id: docRef.id });
    return docRef.id;
  }

  static async obtenerPorId(id: string): Promise<Reporte | null> {
    const doc = await db.collection(COLECCION).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...(doc.data() as Reporte) };
  }

  static async marcarRevisado(id: string, adminId: string, accion: "dejado" | "eliminado" | null, motivoEliminacion?: string | null): Promise<void> {
    const updateObj: any = { revisado: true, adminId, accionTomada: accion };
    if (motivoEliminacion) updateObj.motivoEliminacion = motivoEliminacion;
    await db.collection(COLECCION).doc(id).update(updateObj);
  }
}
