import { db } from '../config/firebase';
import { Mensaje } from '../models/Mensaje';
import * as admin from 'firebase-admin';

 class MensajeRepositorio {
  private mensajes = db.collection('mensajes');

  async crearMensaje(mensaje: Omit<Mensaje, 'id'>): Promise<string> {
    const docRef = await this.mensajes.add({
      ...mensaje,
      fechaHora: admin.firestore.Timestamp.fromDate(mensaje.fechaHora),
    });
    return docRef.id;
  }

  async obtenerMensajes(idPublicacion: string, idUsuario: string): Promise<Mensaje[]> {
    try {
      const snapshot = await this.mensajes
        .where('idPublicacion', '==', idPublicacion)
        .where('participantes', 'array-contains', idUsuario)
        .orderBy('fechaHora', 'asc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fechaHora: doc.data().fechaHora.toDate()
      } as Mensaje));

    } catch (error) {
      console.log('Usando query alternativa...');
      const snapshot = await this.mensajes
        .where('idPublicacion', '==', idPublicacion)
        .where('participantes', 'array-contains', idUsuario)
        .get();

      const mensajes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fechaHora: doc.data().fechaHora.toDate()
      } as Mensaje));

      return mensajes.sort((a, b) => a.fechaHora.getTime() - b.fechaHora.getTime());
    }
  }

  async marcarLeidos(idsMensajes: string[]): Promise<void> {
    const batch = db.batch();
    idsMensajes.forEach(id => batch.update(this.mensajes.doc(id), { leido: true }));
    await batch.commit();
  }
}

export default new MensajeRepositorio();