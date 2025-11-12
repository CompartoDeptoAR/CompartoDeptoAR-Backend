//habla con la bd...
//revisar, aun incompleto...
import { Timestamp } from "firebase-admin/firestore";
import { db } from "../config/firebase";
import { Usuario, UsuarioConId, UsuarioRol } from "../models/Usuario";


export class UsuarioRepositorio {

  static async buscarPorId(id: string): Promise<UsuarioConId | null> {
    const doc = await db.collection("usuarios").doc(id).get();
    if (!doc.exists) return null;

    const data = doc.data() as Omit<UsuarioConId, "id">;

    const roles: UsuarioRol[] = Array.isArray(data.rol)
      ? data.rol
      : [{ id: doc.id, rolId: data.rol }];

    const fechaCreacion = data.fechaCreacion instanceof Timestamp
        ? data.fechaCreacion
        : undefined;

    return {
      id: doc.id,
      ...data,
      fechaCreacion,
      rol: roles,
    };
  }
  static async buscarPorCorreo(correo: string): Promise<UsuarioConId | null> {
    const correos = await db.collection("usuarios").where("correo", "==", correo).limit(1).get();
    if (correos.empty) return null;
    const doc = correos.docs[0];
    if (!doc) return null;

    return { id: doc.id, ...(doc.data() as Omit<UsuarioConId, "id">) };
    }

static async crear(usuario: Omit<Usuario, "id">): Promise<UsuarioConId> {
  const docRef = await db.collection("usuarios").add(usuario);
  const usuarioConId: UsuarioConId = { id: docRef.id, ...usuario };
  await docRef.update({ id: docRef.id });
  return usuarioConId;
}


  static async actualizarPerfil(id: string, datos: any): Promise<void> {
    await db.collection("usuarios").doc(id).update(datos);
  }

  static async actualizarRol(id: string, roles: UsuarioRol[]): Promise<void>{
    await db.collection("usuarios").doc(id).update({rol: roles});
  }

  static async actualizarContraseniaPorCorreo(correo: string, hash: string): Promise<void> {
    const usuario = await db.collection("usuarios").where("correo", "==", correo).limit(1).get();
    if (usuario.empty) throw { status: 404, message: "Usuario no encontrado" };
    const idDoc = usuario.docs[0]!.id;
    await db.collection("usuarios").doc(idDoc).update({ contrasenia: hash });
  }

  static async actualizarPromedio(idUsuario: string, promedio: number, cantidad: number): Promise<void> {
    await db.collection("usuarios").doc(idUsuario).update({
      promedioCalificaciones: promedio,
      cantidadCalificaciones: cantidad
    });
  }

  static async huboInteraccion(id1: string, id2: string): Promise<boolean> {
    // Por ahora esta simulado eh:
    return true;
  }
}

