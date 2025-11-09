import { db } from "../config/firebase";
import { Calificacion } from "../models/Calificacion";

const coleccion = db.collection("calificaciones");

export class CalificacionRepositorio {

  static async crear(calificacion: Calificacion): Promise<void> {
    await coleccion.add(calificacion);
  }

  static async obtenerPorUsuario(idUsuario: string): Promise<Calificacion[]> {
    const snapshot = await coleccion.where("idCalificado", "==", idUsuario).get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Calificacion),
    }));
  }

  static async existeCalificacion(idCalificador: string, idCalificado: string): Promise<boolean> {
    const snapshot = await coleccion.where("idCalificador", "==", idCalificador).where("idCalificado", "==", idCalificado).limit(1).get();
    return !snapshot.empty;
  }

}
