import { FieldValue } from "firebase-admin/firestore";
import { db } from "../config/firebase";
import { calcularCoincidencias, PALABRAS_NO_IMPORTANTES, publicacionesFiltradas } from "../helpers/buscarPulicaciones";
import { FiltrosBusqueda, Publicacion } from "../models/Publcacion";

const collection = db.collection("publicaciones");

export class PublicacionRepositorio {

  static async crear(publicacion: Omit<Publicacion, "id">): Promise<Publicacion> {
    try {
      console.log('📝 Creando publicación con datos:', publicacion);

      const publicacionParaFirestore = {
        ...publicacion,
        fechaCreacion: publicacion.createdAt || new Date(),
        createdAt: publicacion.createdAt || new Date(),
        estado: "activa"
      };

      console.log('🔥 Enviando a Firestore:', publicacionParaFirestore);

      const docRef = await collection.add(publicacionParaFirestore);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new Error("No se pudo crear la publicación");
      }

      const publicacionCreada = {
        id: doc.id,
        ...doc.data() as Publicacion
      };

      console.log('✅ Publicación creada con ID:', doc.id);
      return publicacionCreada;

    } catch (error) {
      console.error("Error en repositorio al crear publicación:", error);
      throw {
        status: 500,
        message: `Error al guardar la publicación: ${error}`
      };
    }
  }

  static async obtenerPorId(id: string): Promise<Publicacion | null> {
    const doc = await collection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...(doc.data() as Publicacion) };
  }

  static async misPublicaciones(usuarioId: string): Promise<Publicacion[]> {
    const misPublicaciones = await collection.where('usuarioId', '==', usuarioId).where('estado', 'in', ['activa', 'pausada']).get();

    return misPublicaciones.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Publicacion),
    }));
  }

  static async traerTodas(limit: number = 100): Promise<Publicacion[]> {
    const publicaciones = await collection.where('estado', '==', 'activa').limit(limit).select('titulo', 'ubicacion', 'precio', 'foto').get();

    return publicaciones.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Publicacion),
    }));
  }

  static async traerPaginadas(limit: number, empezarDespDeId?: string): Promise<{ publicaciones: Publicacion[], ultId?: string }> {
    let query = collection.where("estado", "==", "activa").orderBy("__name__", "desc").limit(limit).select('titulo', 'ubicacion', 'precio', 'foto');

    if (empezarDespDeId) {
      const ultDocRef = await collection.doc(empezarDespDeId).get();
      if (ultDocRef.exists) {
        query = query.startAfter(ultDocRef);
      }
    }
    const snapshot = await query.get();
    if (snapshot.empty) {
      return { publicaciones: [] };
    }
    const publicaciones = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Publicacion)
    }));
    const ultDoc = snapshot.docs[snapshot.docs.length - 1];
    return { publicaciones, ultId: ultDoc?.id! };
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
    if (datos.usuarioId && datos.usuarioId !== usuarioId) {
      throw { status: 403, message: "No podes cambiar el owner de la publicacion" };
    }
    const { id, usuarioId: _, createdAt, ...datosActualizables } = datos;

    await publicacionRef.update({
      ...datosActualizables,
      updatedAt: FieldValue.serverTimestamp()
    });
  }

  static async eliminar(id: string, eliminacionFisica: boolean = false): Promise<void> {
    if (eliminacionFisica) {
      await collection.doc(id).delete();
    } else {
      await collection.doc(id).update({
        estado: "eliminada",
        updatedAt: FieldValue.serverTimestamp()
      });
    }
  }

  static async buscar(texto: string, limit: number = 50): Promise<Publicacion[]> {
    const publicacionesFiltradasResult = await publicacionesFiltradas(texto);

    if (publicacionesFiltradasResult.length === 0) {
      throw { status: 404, message: "Todavia no hay publicaciones que coincidan con tu busqueda." };
    }
    const palabrasBuscadas = texto.toLowerCase().split(" ").filter(p => p !== "" && !PALABRAS_NO_IMPORTANTES.includes(p));
    const publicacionesConPuntaje = publicacionesFiltradasResult.map(pub => ({
      publicacion: pub,
      puntaje: calcularCoincidencias(pub, palabrasBuscadas)
    }));

    return publicacionesConPuntaje.sort((a, b) => b.puntaje - a.puntaje).slice(0, limit).map(item => item.publicacion);
  }

  static async buscarConFiltros(filtros: FiltrosBusqueda, limit: number = 50): Promise<Publicacion[]> {
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

    const snapshot = await query.limit(limit).get();
    let resultados: Publicacion[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Publicacion),
    }));

    // Filtros q estan en memoria (por ahora)
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

    return resultados.slice(0, limit);
  }
}