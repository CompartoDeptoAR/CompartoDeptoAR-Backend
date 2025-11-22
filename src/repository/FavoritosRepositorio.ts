import { FieldValue } from "firebase-admin/firestore";
import { db } from "../config/firebase";
import { Favorito } from "../models/Favorito";
import { Publicacion } from "../models/Publcacion";


const collection = db.collection("favoritos");
const publicacionesCollection = db.collection("publicaciones");

export class FavoritoRepositorio {

  static async agregar(usuarioId: string, publicacionId: string): Promise<Favorito> {
    const existente = await collection.where("usuarioId", "==", usuarioId).where("publicacionId", "==", publicacionId).get();

    if (!existente.empty) {
      throw { status: 400, message: "La publicacion ya esta marcada como favorita 🤔." };
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
    const favoritos = await collection.where("usuarioId", "==", usuarioId).where("publicacionId", "==", publicacionId).get();

    const doc = favoritos.docs[0];
        if (!doc) {
        throw { status: 404, message: "No se encontro la publicacion en tus favoritos 👎." };
        }

        await collection.doc(doc.id).delete();
  }


  static async obtenerPorUsuario(usuarioId: string): Promise<Favorito[]> {
    const favoritos = await collection.where("usuarioId", "==", usuarioId).get();

    return favoritos.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Favorito),
    }));
  }
   static async obtenerPublicacionesFavoritas(usuarioId: string): Promise<Publicacion[]> {
    const favoritos = await this.obtenerPorUsuario(usuarioId);

    if (favoritos.length === 0) return [];

    const publicaciones: Publicacion[] = [];

    for (const fav of favoritos) {
      const pubSnap = await publicacionesCollection.doc(fav.publicacionId).get();

      if (pubSnap.exists) {
        publicaciones.push({
          id: pubSnap.id,
          ...(pubSnap.data() as Publicacion)
        });
      }
    }

    return publicaciones;
  }
}

