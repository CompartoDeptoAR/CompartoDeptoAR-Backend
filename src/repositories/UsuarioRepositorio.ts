//habla con la bd...
//revisar, aun incompleto...
import { Timestamp } from "firebase-admin/firestore";
import { db } from "../config/firebase";
import { UsuarioConId, UsuarioRol } from "../models/Usuario";


const COLECCION = "usuarios";

export class UsuarioRepositorio {

  static async buscarPorId(id: string): Promise<UsuarioConId | null> {
    const doc = await db.collection("usuarios").doc(id).get();
    if (!doc.exists) return null;
    const data = doc.data() as Omit<UsuarioConId, "id">;

    let fecha: Date | undefined;
    if (data.fechaCreacion && "_seconds" in data.fechaCreacion) {
      const ts = data.fechaCreacion as unknown as Timestamp;
      fecha = new Date(ts.seconds * 1000 + ts.nanoseconds / 1000000);
    }
      const roles: UsuarioRol[] = Array.isArray(data.rol)
    ? data.rol
    : [{ id: doc.id, /*usuarioId: doc.id,*/ rolId: data.rol }];

    return {
      id: doc.id,
      ...data,
      fechaCreacion: fecha,
      rol: roles
    };
  }

  static async buscarPorCorreo(correo: string): Promise<UsuarioConId | null> {
    const correos = await db.collection(COLECCION).where("correo", "==", correo).limit(1).get();
    if (correos.empty) return null;
    const doc = correos.docs[0];
    if (!doc) return null;

    return { id: doc.id, ...(doc.data() as Omit<UsuarioConId, "id">) };
    }


  static async crear(usuario: Omit<UsuarioConId, "id">): Promise<UsuarioConId> {
    const docRef = await db.collection(COLECCION).add(usuario);
    return { id: docRef.id, ...usuario };//Firestone genera el ID automaticamente cuando se guarda un doc.
  }

  static async actualizarPerfil(id: string, datos: any): Promise<void> {
    await db.collection(COLECCION).doc(id).update(datos);
  }

  static async actualizarRol(id: string, roles: UsuarioRol[]): Promise<void>{
    await db.collection(COLECCION).doc(id).update({rol: roles});
  }

  static async actualizarContraseniaPorCorreo(correo: string, hash: string): Promise<void> {
    const usuario = await db.collection("usuarios").where("correo", "==", correo).limit(1).get();
    if (usuario.empty) throw { status: 404, message: "Usuario no encontrado" };
    const idDoc = usuario.docs[0]!.id;
    await db.collection("usuarios").doc(idDoc).update({ contrasenia: hash });
  }
}

