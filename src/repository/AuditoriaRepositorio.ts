import { db } from "../config/firebase";
import { Timestamp } from "firebase-admin/firestore";

const COLECCION = "auditoria";

export class AuditoriaRepositorio {
  static async registrar(entrada: { adminId: string; accion: string; detalles?: any; fecha?: any }): Promise<string> {
    const docRef = await db.collection(COLECCION).add({
      adminId: entrada.adminId,
      accion: entrada.accion,
      detalles: entrada.detalles ?? null,
      fecha: entrada.fecha ?? Timestamp.now()
    });
    await docRef.update({ id: docRef.id });
    return docRef.id;
  }
}