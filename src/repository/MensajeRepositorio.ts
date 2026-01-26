// ============= REPOSITORY (sin cambios) =============
import { db } from '../config/firebase';
import { Mensaje } from '../models/Mensaje';
import { AppError } from '../error/AppError';

export class MensajeRepositorio {
  private mensajes = db.collection('mensajes');

  async crearMensaje(mensaje: Omit<Mensaje, 'id'>): Promise<string> {
    const docRef = await this.mensajes.add({
      ...mensaje,
      fechaHora: mensaje.fechaEnvio,
    });
    return docRef.id;
  }

  async obtenerMensajes(idPublicacion: string, idUsuario: string): Promise<Mensaje[]> {
    try {
      const snapshot = await this.mensajes.where('idPublicacion', '==', idPublicacion).where('participantes', 'array-contains', idUsuario).orderBy('fechaEnvio', 'asc').get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fechaEnvio: doc.data().fechaEnvio,
      })) as Mensaje[];

    } catch (error) {
      //console.log('Usando query alternativa...');
      const snapshot = await this.mensajes.where('idPublicacion', '==', idPublicacion).where('participantes', 'array-contains', idUsuario).get();

      const mensajes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fechaEnvio: doc.data().fechaEnvio,
      })) as Mensaje[];

      return mensajes.sort((a, b) =>
        a.fechaEnvio.toMillis() - b.fechaEnvio.toMillis()
      );
    }
  }

  async obtenerPorId(id: string): Promise<Mensaje | null> {
    const doc = await this.mensajes.doc(id).get();
    if (!doc.exists) return null;

    return {
      id: doc.id,
      ...(doc.data() as Mensaje)
    };
  }

  async eliminarMensaje(idMensaje: string): Promise<void> {
    const mensaje = await this.obtenerPorId(idMensaje);
    if (!mensaje) {
      throw new AppError("Mensaje no encontrado", 404);
    }
    await this.mensajes.doc(idMensaje).delete();
  }

  async marcarComoEliminado(id: string): Promise<void> {
    const mensaje = await this.obtenerPorId(id);
    if (!mensaje) {
      throw new AppError("Mensaje no encontrado", 404);
    }

    await this.mensajes.doc(id).update({
      estado: "eliminado",
      fechaActualizacion: new Date()
    });
  }

  async marcarLeidos(idsMensajes: string[]): Promise<void> {
    if (!idsMensajes.length) {
      return;
    }

    const batch = db.batch();
    idsMensajes.forEach(id => {
      batch.update(this.mensajes.doc(id), { leido: true });
    });
    await batch.commit();
  }
}

export default new MensajeRepositorio();