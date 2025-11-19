import { FieldValue } from "firebase-admin/firestore";
import { db } from "../config/firebase";
import { calcularCoincidencias, PALABRAS_NO_IMPORTANTES, publicacionesFiltradas } from "../helpers/buscarPulicaciones";
import { FiltrosBusqueda, Publicacion } from "../models/Publcacion";

const collection = db.collection("publicaciones");

export class PublicacionRepositorio {
  static async crear(publicacion: Omit<Publicacion, "id">): Promise<Publicacion> {
    const nuevaPublicacion = await collection.add(publicacion);
    const doc = await nuevaPublicacion.get();
    return { id: doc.id, ...(doc.data() as Publicacion) };
  }

  static async obtenerPorId(id: string): Promise<Publicacion | null> {
    const doc = await collection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...(doc.data() as Publicacion) };
  }

  static async misPublicaciones(usuarioId: string): Promise<Publicacion[]> {
    const misPublicaciones = await collection.where('usuarioId', '==', usuarioId).get();
    return misPublicaciones.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Publicacion),
    }));
  }

  static async traerTodas(): Promise<Publicacion[]> {
    const publicaciones = await collection.where('estado', '==', 'activa').get();
    return publicaciones.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Publicacion),
    }));
  }

  static async traerPaginadas(limit: number,empezarDespDeId?: string): Promise<{ publicaciones: Publicacion[], ultId?: string | undefined }> {
    let query = collection.where("estado", "==", "activa").orderBy("__name__", "desc").limit(limit);

    if (empezarDespDeId) {
      const ultDocRef = await collection.doc(empezarDespDeId).get();
      if (ultDocRef.exists) {
        query = query.startAfter(ultDocRef);
      }
    }
    const snapshot = await query.get();
    if (snapshot.empty) {
      return {
        publicaciones: [],
        ultId: undefined
      };
    }
    const publicaciones = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Publicacion)
    }));
    const ultDoc = snapshot.docs[snapshot.docs.length - 1];
    return {
      publicaciones,
      ultId: ultDoc?.id
    };
  }

  static async actualizar(usuarioId: string, idPublicacion: string, datos: Partial<Publicacion>): Promise<void> {
    const publicacionRef = collection.doc(idPublicacion);
    const publicacionDoc = await publicacionRef.get();

    if (!publicacionDoc.exists) {
      throw { status: 404, message: "La publicacion no existe." };
    }

    const publicacion = publicacionDoc.data() as Publicacion;

    if (publicacion.usuarioId !== usuarioId) {
      throw { status: 403, message: "No tenes permisos para modificar esta publicacion" };
    }
    const { id, usuarioId: _, createdAt, ...datosActualizables } = datos;
    await publicacionRef.update({
      ...datosActualizables,
      updatedAt: FieldValue.serverTimestamp()
    });
  }

  static async eliminar(id: string): Promise<void> {
    await collection.doc(id).delete();
  }

  static async marcarComoEliminada(id: string): Promise<void> {
    await collection.doc(id).update({
      estado: "eliminada",
      updatedAt: FieldValue.serverTimestamp()
    });
  }

  static async buscar(texto: string): Promise<Publicacion[]> {
    const publicacionesFiltradasResult = await publicacionesFiltradas(texto);

    if (publicacionesFiltradasResult.length === 0) {
      throw { status: 404, message: "Todavia no hay publicaciones que coincidan con tu busqueda." };
    }

    const palabrasBuscadas = texto.toLowerCase()
      .split(" ")
      .filter(p => p !== "" && !PALABRAS_NO_IMPORTANTES.includes(p));

    const ordenarXCoincidencia = (pub1: Publicacion, pub2: Publicacion): number => {
      return calcularCoincidencias(pub2, palabrasBuscadas) - calcularCoincidencias(pub1, palabrasBuscadas);
    };

    return publicacionesFiltradasResult.sort(ordenarXCoincidencia);
  }

  static async buscarConFiltros(filtros: FiltrosBusqueda): Promise<Publicacion[]> {
    let query = collection.where("estado", "==", "activa");

    if (filtros.ubicacion) {
      query = query.where("ubicacion", "==", filtros.ubicacion);
    }

    if (filtros.precioMin !== undefined) {
      query = query.where("precio", ">=", filtros.precioMin);
    }

    if (filtros.precioMax !== undefined) {
      query = query.where("precio", "<=", filtros.precioMax);
    }

    const snapshot = await query.get();
    let resultados: Publicacion[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Publicacion),
    }));

    if (filtros.noFumadores) {
      resultados = resultados.filter(pub =>
        pub.preferencias?.fumador === false || pub.preferencias?.fumador === undefined
      );
    }

    if (filtros.sinMascotas) {
      resultados = resultados.filter(pub =>
        pub.preferencias?.mascotas === false || pub.preferencias?.mascotas === undefined
      );
    }

    if (filtros.tranquilo !== undefined) {
      resultados = resultados.filter(pub =>
        pub.habitos?.tranquilo === filtros.tranquilo || pub.habitos?.tranquilo === undefined
      );
    }

    if (filtros.social !== undefined) {
      resultados = resultados.filter(pub =>
        pub.habitos?.social === filtros.social || pub.habitos?.social === undefined
      );
    }

    return resultados;
  }
}