import { db } from "../config/firebase";
import { PublicacionDto } from "../dtos/publicacionesDto";
import { Publicacion } from "../models/Publcacion";

export function acomodarTexto(texto: string): string {
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

export function calcularCoincidencias(publicacion: Publicacion, palabrasBuscadas: string[]): number{
     const tituloNormalizado = acomodarTexto(publicacion.titulo);
     const descripcionNormalizado = acomodarTexto(publicacion.descripcion);
     let puntaje = 0;
    palabrasBuscadas.forEach(palabra => {
        if (tituloNormalizado.includes(palabra)) puntaje += 3;
        if (descripcionNormalizado.includes(palabra)) puntaje += 1;
    });
    return puntaje;
}
export const PALABRAS_NO_IMPORTANTES = ["la", "el", "los", "las", "en", "que", "y", "con", "para", "un", "una", "de", "del"];
export async function publicacionesFiltradas(texto: string): Promise<Publicacion[]> {
  const publicacionesActivas = await db.collection("publicaciones").where("estado", "==", "activa").get();
  const publicaciones = publicacionesActivas.docs.map(doc => ({ id: doc.id, ...(doc.data() as Publicacion)}));

  const palabrasBuscadas = acomodarTexto(texto).split(" ").filter(p => p !== "" && !PALABRAS_NO_IMPORTANTES.includes(p));

  const pf = publicaciones.filter(pub => {
    const tituloNormalizado = acomodarTexto(pub.titulo);
    const descripcionNormalizado = acomodarTexto(pub.descripcion);
    return palabrasBuscadas.some(palabra => tituloNormalizado.includes(palabra) || descripcionNormalizado.includes(palabra));
  });

  return pf;
}
