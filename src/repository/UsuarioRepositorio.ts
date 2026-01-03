import { Timestamp } from "firebase-admin/firestore";
import { admin, db } from "../config/firebase";
import {HabitosUsuario,PreferenciasUsuario,Usuario,UsuarioConId,UsuarioPerfil,UsuarioRol} from "../models/Usuario";
import { TipoRol } from "../models/tipoRol";
import { AppError } from "../error/AppError";

const collection = db.collection("usuarios");

export class UsuarioRepositorio {

  static async crearDesdeGoogle(data: {correo: string;firebaseUid: string;nombreCompleto: string;fotoUrl?: string;}): Promise<any> {
    //console.log("[GOOGLE] Creando usuario nuevo con Google...");
    const nuevoRef = db.collection("usuarios").doc();
    const id = nuevoRef.id;

    const usuarioData = {
      id,
      correo: data.correo,
      firebaseUid: data.firebaseUid,
      rol: [{ rolId: TipoRol.USER_ROLE }],
      perfil: {
        nombreCompleto: data.nombreCompleto || "",
        fotoUrl: data.fotoUrl || "",
        descripcion: "",
        genero: "",
        edad: null,
      },
      creadoEn: new Date(),
    };

    await nuevoRef.set(usuarioData);
    //console.log("[GOOGLE] Usuario creado correctamente:", id);

    return {
      ...usuarioData,
      id
    };
  }

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

  static async listarTodos(): Promise<UsuarioConId[]> {
    const snapshot = await db.collection("usuarios").get();

    return snapshot.docs.map(doc => {
      const data = doc.data() as Omit<UsuarioConId, "id">;
      return {
        id: doc.id,
        ...data
      } as UsuarioConId;
    });
  }

  static async eliminar(id: string): Promise<boolean> {
    const usuarioSnap = await db.collection("usuarios").doc(id).get();
    if (!usuarioSnap.exists) {
      throw new AppError("Usuario no encontrado", 404);
    }

    const publicacionesSnap = await db.collection("publicaciones").where("usuarioId", "==", id).get();

    const batch = db.batch();
    publicacionesSnap.forEach(doc => batch.delete(doc.ref));
    batch.delete(db.collection("usuarios").doc(id));
    await batch.commit();

    return true;
  }

  static async eliminarCuentaUsuario(usuarioId: string): Promise<void> {
    const usuario = await UsuarioRepositorio.buscarPorId(usuarioId);

    if (!usuario) {
      throw new AppError("Usuario no encontrado", 404);
    }

    const firebaseUid = usuario.firebaseUid;
    if (firebaseUid) {
      try {
        await admin.auth().deleteUser(firebaseUid);
        //console.log(`Usuario ${firebaseUid} eliminado de Firebase Auth`);
      } catch (authError: any) {
       // console.error("Error al eliminar de Firebase Auth:", authError);
      }
    }

    await UsuarioRepositorio.eliminarMensajesUsuario(usuarioId);
    await UsuarioRepositorio.eliminarNotificacionesUsuario(usuarioId);
    await UsuarioRepositorio.eliminar(usuarioId);

    //console.log(`Cuenta de usuario ${usuarioId} eliminada completamente`);
  }

  // Segn lei, estos try/catch se dejan porq son tareas de limpieza y un error aca no deberia frenar el flujo principal, pero no se, permitime dudarlo xD

  private static async eliminarMensajesUsuario(usuarioId: string): Promise<void> {
    try {
      const mensajesEmisor = await db.collection("mensajes").where("emisorId", "==", usuarioId).get();

      const mensajesReceptor = await db.collection("mensajes").where("receptorId", "==", usuarioId).get();

      const batch = db.batch();
      mensajesEmisor.forEach(doc => batch.delete(doc.ref));
      mensajesReceptor.forEach(doc => batch.delete(doc.ref));

      if (mensajesEmisor.size > 0 || mensajesReceptor.size > 0) {
        await batch.commit();
        //console.log(`Eliminados ${mensajesEmisor.size + mensajesReceptor.size} mensajes`);
      }
      const chats = await db.collection("chats").where("participantes", "array-contains", usuarioId).get();

      if (chats.size > 0) {
        const batchChats = db.batch();
        chats.forEach(doc => batchChats.delete(doc.ref));
        await batchChats.commit();
        //console.log(`Eliminados ${chats.size} chats`);
      }
    } catch (error: any) {
     // console.error("Error al eliminar mensajes del usuario:", error);
    }
  }

  private static async eliminarNotificacionesUsuario(usuarioId: string): Promise<void> {
    try {
      const notificaciones = await db.collection("notificaciones").where("usuarioId", "==", usuarioId).get();

      if (notificaciones.size > 0) {
        const batch = db.batch();
        notificaciones.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        console.log(`Eliminadas ${notificaciones.size} notificaciones`);
      }
    } catch (error: any) {
      //console.error("Error al eliminar notificaciones del usuario:", error);
    }
  }

  static async buscarPorCorreo(correo: string): Promise<Usuario | null> {
    const snapshot = await db.collection("usuarios").where("correo", "==", correo.toLowerCase().trim()).limit(1).get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { id: doc!.id, ...doc!.data() } as Usuario;
  }

  static async crear(usuario: Usuario): Promise<UsuarioConId> {
    const usuarioData = {
      correo: usuario.correo,
      contraseña: usuario.contraseña,
      firebaseUid: usuario.firebaseUid || "",
      rol: usuario.rol,
      fechaCreacion: usuario.fechaCreacion || Timestamp.now(),
      perfil: usuario.perfil,
      promedioCalificaciones: usuario.promedioCalificaciones || 0,
      cantidadCalificaciones: usuario.cantidadCalificaciones || 0
    };

    const docRef = await collection.add(usuarioData);

    const usuarioConId: UsuarioConId = {
      id: docRef.id,
      ...usuarioData
    };

    await docRef.update({ id: docRef.id });

    return usuarioConId;
  }

  static async actualizarPerfil(id: string,datos: Partial<UsuarioPerfil> ): Promise<void> {
    const docActual = await collection.doc(id).get();
    if (!docActual.exists) {
      throw new AppError("Usuario no encontrado", 404);
    }

    const usuarioActual = docActual.data() as Usuario;
    const perfilActualizado: UsuarioPerfil = {
      ...usuarioActual.perfil,
      ...datos,
    };

    //console.log("Perfil actualizado localmente:", perfilActualizado);

    await collection.doc(id).update({
      perfil: perfilActualizado
    });

    //console.log("Perfil guardado en Firestore");
  }

  static async actualizarRol(id: string, roles: UsuarioRol[]): Promise<void> {
    await collection.doc(id).update({ rol: roles });
  }

  static async actualizarContraseniaPorCorreo(correo: string,hash: string): Promise<void> {
    const usuario = await collection.where("correo", "==", correo).limit(1).get();

    if (usuario.empty) {
      throw new AppError("Usuario no encontrado", 404);
    }

    const idDoc = usuario.docs[0]!.id;
    await db.collection("usuarios").doc(idDoc).update({ contrasenia: hash });
  }

  static async actualizarPromedio(idUsuario: string,promedio: number,cantidad: number ): Promise<void> {
    await collection.doc(idUsuario).update({
      promedioCalificaciones: promedio,
      cantidadCalificaciones: cantidad
    });
  }

  static async huboInteraccion(idCalificador: string,idCalificado: string): Promise<boolean> {
    const snapshot = await db.collection("mensajes").where("participantes", "array-contains", idCalificador).get();

    return snapshot.docs.some(doc => {
      const participantes: string[] = doc.data().participantes || [];
      return participantes.includes(idCalificado);
    });
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
