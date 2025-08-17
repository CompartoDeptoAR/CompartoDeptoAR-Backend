//revisar, aun incompleto...
import { db } from "../config/firebase";
import { Usuario, UsuarioConId } from "../models/Usuario";


const COLECCION = "usuarios";

export class UsuarioRepositorio {
  static async buscarPorId(id: string): Promise<UsuarioConId | null> {
    const doc = await db.collection(COLECCION).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...(doc.data() as Omit<UsuarioConId, "id">) };
  }

  static async buscarPorCorreo(correo: string): Promise<UsuarioConId | null> {
    const snap = await db
        .collection(COLECCION)
        .where("correo", "==", correo)
        .limit(1)
        .get();

    if (snap.empty) return null;

    const doc = snap.docs[0];
    if (!doc) return null;

    return { id: doc.id, ...(doc.data() as Omit<UsuarioConId, "id">) };
    }


  static async crear(usuario: Omit<UsuarioConId, "id">): Promise<UsuarioConId> {
    const docRef = await db.collection(COLECCION).add(usuario);
    return { id: docRef.id, ...usuario };
  }
}

