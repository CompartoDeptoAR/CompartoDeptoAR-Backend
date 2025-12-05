import { Timestamp } from "firebase-admin/firestore";
import { db } from "../config/firebase";
import { HabitosUsuario, PreferenciasUsuario, Usuario, UsuarioConId, UsuarioRol } from "../models/Usuario";
import { TipoRol } from "../models/tipoRol";

const collection = db.collection("usuarios");

export class UsuarioRepositorio {
  static async crearDesdeGoogle(data: { correo: string; firebaseUid: string; nombreCompleto: string; fotoUrl?: string; }): Promise<any> {
    try {
      console.log("[GOOGLE] Creando usuario nuevo con Google...");
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

      console.log("[GOOGLE] Usuario creado correctamente:", id);

      return {
        ...usuarioData,
        id
      };

    } catch (error: any) {
      console.error("[GOOGLE] Error creando usuario desde Google:", error);
      throw new Error("No se pudo crear el usuario con Google");
    }
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

  static async eliminar(id: string): Promise<boolean> {
    try {
      const usuarioSnap = await db.collection("usuarios").doc(id).get();
      if (!usuarioSnap.exists) throw new Error("Usuario no encontrado");

      const publicacionesSnap = await db
        .collection("publicaciones")
        .where("usuarioId", "==", id)
        .get();

      const batch = db.batch();
      publicacionesSnap.forEach((doc) => batch.delete(doc.ref));
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
      const snapshot = await db.collection('usuarios')
        .where('correo', '==', correo.toLowerCase().trim())
        .limit(1)
        .get();

      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return { id: doc!.id, ...doc!.data() } as Usuario;

    } catch (error) {
      throw error;
    }
  }

  static async crear(usuario: Usuario): Promise<UsuarioConId> {
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

      const usuarioConId: UsuarioConId = {
        id: docRef.id,
        ...usuarioData
      };

      await docRef.update({ id: docRef.id });

      return usuarioConId;
    } catch (error) {
      throw error;
    }
  }

  static async actualizarPerfil(id: string, datos: any): Promise<void> {
    await collection.doc(id).update(datos);
  }

  static async actualizarRol(id: string, roles: UsuarioRol[]): Promise<void> {
    await collection.doc(id).update({ rol: roles });
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
    const snapshot1 = await db.collection("mensajes")
      .where("participantes", "array-contains", idCalificador)
      .get();

    const hubo = snapshot1.docs.some(doc => {
      const participantes: string[] = doc.data().participantes || [];
      return participantes.includes(idCalificado);
    });

    return hubo;
  }

  static async obtenerHabitosYPreferencias(usuarioId: string): Promise<{ habitos: HabitosUsuario | undefined; preferencias: PreferenciasUsuario | undefined; } | null> {
    const doc = await collection.doc(usuarioId).get();
    if (!doc.exists) return null;
    const usuario = doc.data() as Usuario;
    return {
      habitos: usuario.perfil?.habitos ?? undefined,
      preferencias: usuario.perfil?.preferencias ?? undefined,
    };
  }
}
