//Tiempo al tiempo (?
import { db } from "../config/firebase";
import { PublicacionDto } from "../dtos/publicacionesDto";
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
    // dsp la idea es armar aca la query con los filtros dinamicos y traer las publicaciones activas que cumplan con los filtros (ubicacion, precio, etc)...
    static async buscar (filtros: FiltrosBusqueda):Promise<Publicacion[]>{
        throw new Error ("method not implemented")
    }
}