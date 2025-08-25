//Tiempo al tiempo (?
import { db } from "../config/firebase";
import { PublicacionDto } from "../dtos/publicacionesDto";
import { acomodarTexto,calcularCoincidencias, publicacionesFiltradas } from "../helpers/buscarPulicaciones";
import { FiltrosBusqueda, Publicacion } from "../models/Publcacion";

export class PublicacionRepositorio{

    static async crear(publicacion: Omit<Publicacion, "id">): Promise<Publicacion> {
        const nuevaPublicacion= await db.collection("publicaciones").add(publicacion);
        return { id: nuevaPublicacion.id, ...publicacion };
    }

    static async traerTodas(): Promise<Publicacion[]> {
        const publicacione = await db.collection("publicaciones").where('estado', '==', 'activa').get();
        return publicacione.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Publicacion),
        }));
    }

    static async actualizar(id: string, publicacion: Partial<PublicacionDto>): Promise<void> {
        await db.collection("publicaciones").doc(id).update({ estado: 'eliminada' });
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