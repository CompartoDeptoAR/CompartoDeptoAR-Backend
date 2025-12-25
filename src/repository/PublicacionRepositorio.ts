import { FieldValue } from "firebase-admin/firestore";
import { db } from "../config/firebase";
import { calcularCoincidencias, PALABRAS_NO_IMPORTANTES, publicacionesFiltradas } from "../helpers/buscarPulicaciones";
import { FiltrosBusqueda, Publicacion, PublicacionMini } from "../models/Publcacion";


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

   static async actualizarEstado(id: string, nuevoEstado: "activa" | "pausada" | "eliminada"): Promise<void> {
    try {
      await db.collection('publicaciones').doc(id).update({
        estado: nuevoEstado,
        updatedAt: new Date()
      });
    } catch (error) {
      throw new Error(`Error al actualizar estado: ${error}`);
    }
  }
//esta la puedo usar en varios ladospero ya valio verga y quiero avanzar
  static async usuarioPropietario(publicacionId: string, usuarioId: string): Promise<boolean> {
    try {
      const publicacion = await this.obtenerPorId(publicacionId);
      return publicacion?.usuarioId === usuarioId;
    } catch (error) {
      throw new Error(`Error al verificar propiedad: ${error}`);
    }
  }
  //Es una lista para ADMIN
  static async obtenerEliminadas(): Promise<Publicacion[]> {
    const snapshot = await db.collection("publicaciones").where("estado", "==", "eliminada").orderBy("updatedAt", "desc") .get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Publicacion));
  }

 static async misPublicaciones(usuarioId: string): Promise<Publicacion[]> {
  //console.log("Repositorio - usuarioId recibido:", `"${usuarioId}"`);
  //console.log("Repositorio - longitud usuarioId:", usuarioId.length);
 //console.log("Repositorio - tipo de usuarioId:", typeof usuarioId);

  const misPublicaciones = await collection.where('usuarioId', '==', usuarioId).where('estado', 'in', ['activa', 'pausada']).get();
  //console.log("Repositorio - documentos encontrados:", misPublicaciones.size);
  if (misPublicaciones.size === 0) {
   // console.log("Repositorio - NO se encontraron publicaciones");

    const todasLasPublicaciones = await collection.where('usuarioId', '==', usuarioId).get();
    //console.log("Repositorio - TODAS las publicaciones (sin filtro estado):", todasLasPublicaciones.size);
  }
  return misPublicaciones.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as Publicacion),
  }));
}
 static async eliminarPorUsuario(usuarioId: string): Promise<void> {
    const snapshot = await db.collection("publicaciones").where("usuarioId", "==", usuarioId).get();
    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  }

  static async traerTodas(limit: number = 100): Promise<Publicacion[]> {
    const publicaciones = await collection.where('estado', '==', 'activa').limit(limit).select('titulo', 'ubicacion', 'precio', 'foto').get();

    return publicaciones.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Publicacion),
    }));
  }

  static async traerPaginadas(limit: number, empezarDespDeId?: string): Promise<{ publicaciones: PublicacionMini[], ultId?: string }> {
    let query = collection.where("estado", "==", "activa").orderBy("__name__", "desc").limit(limit).select('titulo', 'ubicacion', 'precio', 'foto', 'estado');

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
      ...(doc.data() as PublicacionMini)
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
  //Tine masculinidad debil, tratalo con carinio
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

    // Solo filtros que Firestore puede hacer good
    if (filtros.precioMin !== undefined) {
      query = query.where("precio", ">=", filtros.precioMin);
    }

    if (filtros.precioMax !== undefined) {
      query = query.where("precio", "<=", filtros.precioMax);
    }

    const snapshot = await query.limit(limit * 2).get(); // Traemos más porque vamos a filtrar en memoria
    let resultados: Publicacion[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Publicacion),
    }));

    if (filtros.ubicacion) {
      const ubicacionBusqueda = filtros.ubicacion.toLowerCase().trim();
      resultados = resultados.filter(pub =>
        pub.ubicacion?.toLowerCase().includes(ubicacionBusqueda)
      );
    }

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