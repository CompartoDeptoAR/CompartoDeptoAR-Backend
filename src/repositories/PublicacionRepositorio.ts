//Tiempo al tiempo (?
import { db } from "../config/firebase";
import { PublicacionDto } from "../dtos/publicacionesDto";
import { acomodarTexto } from "../helpers/acomodarTexto";
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
    // Se me ocurrio mejor separar, osea poder buscar comun y con filtros, soy media lenta eh
    //y con el toLowerCase hago q no importen las MAY o las min, DATASO para mi q no sabia jaja
    //desp lo separo en funciones aux asi no queda tan feo, porq si,esta feo...
    static async buscar(texto: string): Promise<Publicacion[]> {
        const publicacionesActivas = await db.collection("publicaciones").where("estado", "==", "activa").get();
        const publicaciones = publicacionesActivas.docs.map(doc => ({ id: doc.id, ...(doc.data() as Publicacion)}));
        const palabrasNoImportantes= ["la", "el", "los", "las", "en", "que", "y", "con", "para", "un", "una", "de", "del"];
        const palabrasBuscadas = acomodarTexto(texto).split(" ").filter(p => p !== "" && !palabrasNoImportantes.includes(p));
        const publicacionesFiltradas = publicaciones.filter(pub => {
            const tituloNormalizado = acomodarTexto(pub.titulo);
            const descripcionNormalizado = acomodarTexto(pub.descripcion);

            return palabrasBuscadas.some(palabra =>
                tituloNormalizado.includes(palabra) || descripcionNormalizado.includes(palabra)
            );
        });
        if (publicacionesFiltradas.length === 0) {
        throw { status: 404, message: "Aun no publicaciones que coincidan con tu busqueda." };
        }
        const ordenarPorCoincidencia = (pub1: Publicacion, pub2: Publicacion): number => {
            const calcularCoincidencias = (pub: Publicacion): number => {
                const tituloNormalizado = acomodarTexto(pub.titulo);
                const descripcionNormalizado = acomodarTexto(pub.descripcion);
                let puntaje = 0;

                palabrasBuscadas.forEach(palabra => {
                    if (tituloNormalizado.includes(palabra)) puntaje += 3;
                    if (descripcionNormalizado.includes(palabra)) puntaje += 1;
                });
                return puntaje;
            };
            return calcularCoincidencias(pub2) - calcularCoincidencias(pub1);
        };

        return publicacionesFiltradas.sort(ordenarPorCoincidencia);
    }

     static async buscarConFiltros(filtros: FiltrosBusqueda):Promise<void> /*Promise<Publicacion[]>*/ {
        console.log("Proximamente en los mejores codigos")
     }
}