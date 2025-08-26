//Tiempo al tiempo (?
import { FieldValue } from "firebase-admin/firestore";
import { db } from "../config/firebase";
import { calcularCoincidencias, publicacionesFiltradas } from "../helpers/buscarPulicaciones";
import { FiltrosBusqueda, Publicacion } from "../models/Publcacion";

const collection = db.collection("publicaciones");

export class PublicacionRepositorio{

    static async crear(publicacion: Omit<Publicacion, "id">): Promise<Publicacion> {
        const nuevaPublicacion= await db.collection("publicaciones").add(publicacion);
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
        await db.collection("publicaciones").doc(id).delete();
    }
    // Quedo,funciona pero es de masculinidad debil (? jaja
    static async buscar(texto: string): Promise<Publicacion[]> {
        const publicacionsFiltradas = await publicacionesFiltradas(texto);

        if (publicacionsFiltradas.length === 0) {
        throw { status: 404, message: "Todavia no hay publicaciones que coincidan con tu busqueda." };
        }
        const palabrasNoImportantes = ["la", "el", "los", "las", "en", "que", "y", "con", "para", "un", "una", "de", "del"];
        const palabrasBuscadas = texto.toLowerCase().split(" ").filter(p => p !== "" && !palabrasNoImportantes.includes(p));
        const ordenarXCoincidencia = (pub1: Publicacion, pub2: Publicacion): number => {
            return calcularCoincidencias(pub2, palabrasBuscadas) - calcularCoincidencias(pub1, palabrasBuscadas);
        };
        return publicacionsFiltradas.sort(ordenarXCoincidencia);
  }
     static async buscarConFiltros(filtros: FiltrosBusqueda):Promise<void> /*Promise<Publicacion[]>*/ {
        console.log("Proximamente en los mejores codigos")
     }
}