import { db } from "../config/firebase";
import { Reporte } from "../models/Reporte";
import { Timestamp } from "firebase-admin/firestore";

const COLECCION = "reportes";

export class ReporteRepositorio {

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

}
