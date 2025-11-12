import { FieldValue } from "firebase-admin/firestore";
import { db } from "../config/firebase";
import { calcularCoincidencias, PALABRAS_NO_IMPORTANTES, publicacionesFiltradas } from "../helpers/buscarPulicaciones";
import { FiltrosBusqueda, Publicacion } from "../models/Publcacion";

const collection = db.collection("publicaciones");

export class PublicacionRepositorio{

    static async crear(publicacion: Omit<Publicacion, "id">): Promise<Publicacion> {
        const nuevaPublicacion= await collection.add(publicacion);
        return { id: nuevaPublicacion.id, ...publicacion };
    }

    static async misPublicaciones(usuarioId: string): Promise<Publicacion[]>{
        const misPublicaciones= await collection.where('usuarioId', '==' , usuarioId).get();
        return misPublicaciones.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Publicacion),
        }));
    }

    static async traerTodas(): Promise<Publicacion[]> {
        const publicacione = await collection.where('estado', '==', 'activa').get();
        return publicacione.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Publicacion),
        }));
    }

    static async traerPaginadas(limit: number, startAfterId?: string): Promise<{ publicaciones: Publicacion[], lastId?: string | undefined }> {
        let query = collection.where('estado', '==', 'activa').orderBy('createdAt', 'desc').limit(limit);

        if (startAfterId) {
          const lastDoc = await collection.doc(startAfterId).get();
          if (lastDoc.exists) {
            query = query.startAfter(lastDoc);
          }
        }

        const snapshot = await query.get();
        const publicaciones = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Publicacion),
        }));

        const lastDoc = snapshot.docs[snapshot.docs.length - 1];
        return {
          publicaciones,
          lastId: lastDoc ? lastDoc.id : undefined
        };
      }
    static async actualizar(usuarioId: string, idPublicacion: string, datos: Partial<Publicacion>): Promise<void> {
        const publcaiones = collection.doc(idPublicacion);
        const publicacionId = await publcaiones.get();
        const publicacion = publicacionId.data() as Publicacion;

        if(!publicacionId.exists){
        throw { status: 404, message: "La publicacion no existe." };
        }
        if (publicacion.usuarioId !== usuarioId) {
        throw { status: 403, message: "No tnes permisos para modificar esta publicacion" };
        }
        const { id, usuarioId: _, createdAt, ...datosActualizables } = datos;
        await publcaiones.update({...datosActualizables,updatedAt: FieldValue.serverTimestamp()});
    }

    static async eliminar(id: string): Promise<void> {
        await collection.doc(id).delete();
    }
    // Quedo,funciona pero es de masculinidad debil (? jaja, por ahora esta comu muy militar...
    static async buscar(texto: string): Promise<Publicacion[]> {
        const publicacionsFiltradas = await publicacionesFiltradas(texto);
        if (publicacionsFiltradas.length === 0) {
          throw { status: 404, message: "Todavia no hay publicaciones que coincidan con tu busqueda." };
        }
        const palabrasBuscadas = texto.toLowerCase().split(" ").filter(p => p !== "" && !PALABRAS_NO_IMPORTANTES.includes(p));
        const ordenarXCoincidencia = (pub1: Publicacion, pub2: Publicacion): number => {
          return calcularCoincidencias(pub2, palabrasBuscadas) - calcularCoincidencias(pub1, palabrasBuscadas);
      };
        return publicacionsFiltradas.sort(ordenarXCoincidencia);
    }
    // Aca salio un [] de funciones de  los filtros, es mucho mas mejor q los if, a check igual eh
    //(Tengo 0 pruebas y 0 dudas)
    //Si la app hace boom por traer muchas cosas inecesarias yo no fui (ruidito a mate)
    //Porq la otra es hacerlo con if pero con una query...
    //actualizacion, lo hice. Asiq me quedo de tres formas, pero creo que la mejor es esta aunque tenga los if.
    //Quizas no es del todocierto que un buen programador no usa if 🤔

      static async buscarConFiltros(filtros: FiltrosBusqueda): Promise<Publicacion[]> {
        let query = collection.where("estado", "==", "activa");

        // Filtros q a Firestore no se le rompe una uña
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

        // Filtros mas ña en memoria (los check)
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

    /*static async buscarConFiltros(filtros: FiltrosBusqueda): Promise<Publicacion[]> {
        const publicacionesActivas = await collection.where("estado", "==", "activa").get();
        const resultados: Publicacion[] = publicacionesActivas.docs.map(doc => ({
            id: doc.id,
            ...(doc.data() as Publicacion),
        }));
        const filtrosActivos = [
            filtros.ubicacion && ((pub: Publicacion) => pub.ubicacion?.toLowerCase() === filtros.ubicacion!.toLowerCase()),
            filtros.precioMin !== undefined && ((pub: Publicacion) =>pub.precio >= filtros.precioMin!),
            filtros.precioMax !== undefined && ((pub: Publicacion) =>pub.precio <= filtros.precioMax!),
            filtros.noFumadores && ((pub: Publicacion) =>pub.preferencias?.fumador === false || !pub.preferencias?.fumador),
            filtros.sinMascotas && ((pub: Publicacion) =>pub.preferencias?.mascotas === false || !pub.preferencias?.mascotas),
            filtros.tranquilo !== undefined && ((pub: Publicacion) =>pub.habitos?.tranquilo === filtros.tranquilo || !pub.habitos?.tranquilo),
            filtros.social !== undefined && ((pub: Publicacion) =>pub.habitos?.social === filtros.social || !pub.habitos?.social)
        ].filter(Boolean) as ((pub: Publicacion) => boolean)[];

        return resultados.filter(pub =>
            filtrosActivos.every(filtro => filtro(pub))
        );
    }

    //ya se q son muchos if, no me cagues a pedo jaja
    static async buscarConFiltros(filtros: FiltrosBusqueda): Promise<Publicacion[]> {

      const publicacionesActivas = await collection.where("estado", "==", "activa").get();
      let resultados: Publicacion[] = publicacionesActivas.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Publicacion),
      }));

      if (filtros.ubicacion) {
        resultados = resultados.filter(pub =>
          pub.ubicacion?.toLowerCase() === filtros.ubicacion?.toLowerCase()
        );
      }

      if (filtros.precioMin !== undefined) {
        resultados = resultados.filter(pub => pub.precio >= filtros.precioMin!);
      }
      if (filtros.precioMax !== undefined) {
        resultados = resultados.filter(pub => pub.precio <= filtros.precioMax!);
      }

      if (filtros.noFumadores !== undefined) {
        resultados = resultados.filter(pub =>
          pub.preferencias?.fumador === false || pub.preferencias?.fumador === undefined
        );
      }

      if (filtros.sinMascotas !== undefined) {
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
    }*/

}
