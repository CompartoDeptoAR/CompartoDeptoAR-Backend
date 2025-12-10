import { FieldValue } from "firebase-admin/firestore";
import { db } from "../config/firebase";
import { Favorito } from "../models/Favorito";
import { Publicacion } from "../models/Publcacion";
import { PublicacionMinDto } from "../dtos/publicacionesDto";

const collection = db.collection("favoritos");
const publicacionesCollection = db.collection("publicaciones");

export class FavoritoRepositorio {
  static async agregar(usuarioId: string, publicacionId: string): Promise<Favorito> {

    const existente = await collection.where("usuarioId", "==", usuarioId).where("publicacionId", "==", publicacionId).get();
    if (!existente.empty) {
      throw { status: 400, message: "La publicacion ya está marcada como favorita ." };
    }

    const publicacionDoc = await publicacionesCollection.doc(publicacionId).get();

    if (!publicacionDoc.exists) {
      throw { status: 404, message: "La publicacion no existe 🙅‍♂️." };
    }

    const publicacionData = publicacionDoc.data() as Publicacion;

    if (publicacionData.estado !== "activa") {
      throw {
        status: 400,
        message: "No podes agregar a favoritos una publicacion q no esta activa 🚫."
      };
    }

    if (publicacionData.usuarioId === usuarioId) {
      throw {
        status: 400,
        message: "No puedes agregar tus propias publicaciones a favoritos zoquete."
      };
    }

    const nuevoFavorito = {
      usuarioId,
      publicacionId,
      fechaGuardado: FieldValue.serverTimestamp(),
    };

    const docRef = await collection.add(nuevoFavorito);
    return { id: docRef.id, ...nuevoFavorito };
  }

static async eliminar(usuarioId: string, publicacionId: string): Promise<void> {
  //console.log('Eliminar favorito: usuarioId=', usuarioId, 'publicacionId=', publicacionId);
  const favoritos = await collection.where("usuarioId", "==", usuarioId).where("publicacionId", "==", publicacionId).get();
  //console.log('Nmero de documentos encontrados:', favoritos.size);

  if (favoritos.empty) {
    //console.log('No se encontro el favorito');
    throw { status: 404, message: "No se encontró la publicación en tus favoritos 👎." };
  }
  const doc = favoritos.docs[0];
  //console.log('Documento a eliminar:', doc!.id);
  await collection.doc(doc!.id).delete();
  //console.log('Documento eliminado exitosamente');
}

  static async obtenerPorUsuario(usuarioId: string): Promise<Favorito[]> {
    const favoritos = await collection.where("usuarioId", "==", usuarioId).get();

    return favoritos.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Favorito),
    }));
  }

  static async obtenerPublicacionesFavoritas(usuarioId: string): Promise<PublicacionMinDto[]> {
    const favoritos = await this.obtenerPorUsuario(usuarioId);

    if (favoritos.length === 0) return [];

    const publicaciones: PublicacionMinDto[] = [];

    for (const fav of favoritos) {
      const pubSnap = await publicacionesCollection.doc(fav.publicacionId).get();

      if (pubSnap.exists) {
        const pubData = pubSnap.data()!;

        if (pubData.estado === "activa") {
          publicaciones.push({
            id: pubSnap.id,
            titulo: pubData.titulo,
            ubicacion: pubData.ubicacion,
            precio: pubData.precio,
            foto: pubData.foto?.[0] ?? null,
            estado: pubData.estado,
          });
        }
      }
    }

    return publicaciones;
  }

  static async esFavorito(usuarioId: string, publicacionId: string): Promise<boolean> {
    const favoritos = await collection.where("usuarioId", "==", usuarioId).where("publicacionId", "==", publicacionId).get();
    return !favoritos.empty;
  }

  static async obtenerIdsFavoritas(usuarioId: string): Promise<string[]> {
    const favoritos = await collection.where("usuarioId", "==", usuarioId).get();
    return favoritos.docs.map(doc => doc.data().publicacionId);
  }
}