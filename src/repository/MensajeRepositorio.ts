import { db } from '../config/firebase';
import { Mensaje } from '../models/Mensaje';

class MensajeRepositorio {
  private mensajes = db.collection('mensajes');

  async crearMensaje(mensaje: Omit<Mensaje, 'id'>): Promise<string> {
    const docRef = await this.mensajes.add({
      ...mensaje,
      fechaHora: mensaje.fechaHora,
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
        fechaHora: doc.data().fechaHora,
      })) as Mensaje[];

    } catch (error) {
      console.log('Usando query alternativa...');

      const snapshot = await this.mensajes
        .where('idPublicacion', '==', idPublicacion)
        .where('participantes', 'array-contains', idUsuario)
        .get();

      const mensajes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fechaHora: doc.data().fechaHora,
      })) as Mensaje[];

      return mensajes.sort((a, b) =>
        a.fechaHora.toMillis() - b.fechaHora.toMillis()
      );
    }
  }

  async marcarLeidos(idsMensajes: string[]): Promise<void> {
    const batch = db.batch();
    idsMensajes.forEach(id => batch.update(this.mensajes.doc(id), { leido: true }));
    await batch.commit();
  }
}

export default new MensajeRepositorio();
