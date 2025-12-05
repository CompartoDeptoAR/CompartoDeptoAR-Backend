import { db } from "../config/firebase";
import { Calificacion } from "../models/Calificacion";

const coleccion = db.collection("calificaciones");

export class CalificacionRepositorio {


  static async crearOActualizar(calificacion: Calificacion): Promise<void> {
    const snapshot = await coleccion.where("idCalificador", "==", calificacion.idCalificador).where("idCalificado", "==", calificacion.idCalificado).limit(1).get();
    if (!snapshot.empty) {
      const docId = snapshot.docs[0]!.id;
      await coleccion.doc(docId).update({
        puntuacion: calificacion.puntuacion,
        comentario: calificacion.comentario,
        fecha: calificacion.fecha,
        nombreCalificador: calificacion.nombreCalificador
      });
    } else {
      await coleccion.add(calificacion);
    }
  }

  static async obtenerPorUsuario(idUsuario: string): Promise<Calificacion[]> {
    const snapshot = await coleccion.where("idCalificado", "==", idUsuario).get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Calificacion)
    }));
  }
   /* static async existeCalificacion(idCalificador: string, idCalificado: string): Promise<boolean> {
    const snapshot = await coleccion.where("idCalificador", "==", idCalificador).where("idCalificado", "==", idCalificado).limit(1).get();
    return !snapshot.empty;
  }*/
}