//habla con la bd...
import { Timestamp } from "firebase-admin/firestore";
import { db } from "../config/firebase";
import { HabitosUsuario, PreferenciasUsuario, Usuario, UsuarioConId, UsuarioRol } from "../models/Usuario";

const collection= db.collection("usuarios");
export class UsuarioRepositorio {

  static async buscarPorId(id: string): Promise<UsuarioConId | null> {
    const doc = await collection.doc(id).get();
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

 static async eliminar(id: string): Promise<boolean>{
    try {
      const usuarioSnap = await db.collection("usuarios").doc(id).get();
      if (!usuarioSnap.exists) {
        throw new Error("Usuario no encontrado");
      }
      const publicacionesSnap = await db
        .collection("publicaciones")
        .where("usuarioId", "==", id)
        .get();

      const batch = db.batch();

      publicacionesSnap.forEach((doc) => {
        batch.delete(doc.ref);
      });
      batch.delete(db.collection("usuarios").doc(id));
      await batch.commit();

      return true;
    } catch (error: any) {
      console.error("Error al eliminar usuario:", error);
      throw new Error(error.message);
    }
  }

static async buscarPorCorreo(correo: string): Promise<Usuario | null> {
  try {
    //console.log(" Buscando usuario por correo:", correo);
    const snapshot = await db.collection('usuarios')
      .where('correo', '==', correo.toLowerCase().trim())
      .limit(1)
      .get();

    //console.log("Usuarios encontrados:", snapshot.size);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    const usuario = { id: doc!.id, ...doc!.data() } as Usuario;
    //console.log("Usuario encontrado:", usuario.id);
    return usuario;
  } catch (error) {
    //console.error("Error en buscarPorCorreo:", error);
    throw error;
  }
}

 static async crear(usuario: Usuario): Promise<UsuarioConId> {
    //console.log('Creando usuario en Firestore:', usuario.correo);
    try {
      const usuarioData = {
        correo: usuario.correo,
        contraseña: usuario.contraseña,
        firebaseUid: usuario.firebaseUid || '',
        rol: usuario.rol,
        fechaCreacion: usuario.fechaCreacion || Timestamp.now(),
        perfil: usuario.perfil,
        promedioCalificaciones: usuario.promedioCalificaciones || 0,
        cantidadCalificaciones: usuario.cantidadCalificaciones || 0
      };

      const docRef = await collection.add(usuarioData);
      //console.log('Documento creado con ID:', docRef.id);

      const usuarioConId: UsuarioConId = {
        id: docRef.id,
        ...usuarioData
      };
      await docRef.update({ id: docRef.id });
      //console.log('ID actualizado en documento');
      return usuarioConId;
    } catch (error) {
      //console.error('Error creando usuario en Firestore:', error);
      throw error;
    }
  }

  static async actualizarPerfil(id: string, datos: any): Promise<void> {
    await collection.doc(id).update(datos);
  }

  static async actualizarRol(id: string, roles: UsuarioRol[]): Promise<void>{
    await collection.doc(id).update({rol: roles});
  }

  static async actualizarContraseniaPorCorreo(correo: string, hash: string): Promise<void> {
    const usuario = await collection.where("correo", "==", correo).limit(1).get();
    if (usuario.empty) throw { status: 404, message: "Usuario no encontrado" };
    const idDoc = usuario.docs[0]!.id;
    await db.collection("usuarios").doc(idDoc).update({ contrasenia: hash });
  }

  static async actualizarPromedio(idUsuario: string, promedio: number, cantidad: number): Promise<void> {
    await collection.doc(idUsuario).update({
      promedioCalificaciones: promedio,
      cantidadCalificaciones: cantidad
    });
  }

static async huboInteraccion(idCalificador: string, idCalificado: string): Promise<boolean> {
  const mensajesSnapshot = await db.collection("mensajes").where("participantes", "array-contains", idCalificador).where("participantes", "array-contains", idCalificado).limit(1).get();
  return !mensajesSnapshot.empty;
}

static async obtenerHabitosYPreferencias(usuarioId: string): Promise<{habitos: HabitosUsuario | undefined;preferencias: PreferenciasUsuario | undefined;} | null> {
  const doc = await collection.doc(usuarioId).get();
  if (!doc.exists) return null;
  const usuario = doc.data() as Usuario;
  return {
  habitos: usuario.perfil?.habitos ?? undefined,
  preferencias: usuario.perfil?.preferencias ?? undefined,
  };
}

}

