import { db } from "../config/firebase";

export class RecuperacionRepository {
  static async guardarToken(correo: string, token: string, expiracion: Date): Promise<void> {
    await db.collection("tokensRecuperacion").doc(token).set({
      correo,
      expiracion,
      usado: false
    });
  }

  static async obtenerPorToken(token: string): Promise<FirebaseFirestore.DocumentData | null | undefined> {
    const doc = await db.collection("tokensRecuperacion").doc(token).get();
    return doc.exists ? doc.data() : null;
  }

  static async marcarComoUsado(token: string): Promise<void> {
    await db.collection("tokensRecuperacion").doc(token).update({ usado: true });
  }
}
