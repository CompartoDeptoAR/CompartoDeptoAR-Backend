import { Timestamp } from 'firebase-admin/firestore';
import mensajeRepositorio from '../repository/MensajeRepositorio';
import { Mensaje } from '../models/Mensaje';
import { pasarADto } from '../dtos/mensajeDto';

class MensajeServicio {

  async enviarMensaje(idRemitente: string, idDestinatario: string, idPublicacion: string, contenido: string) {
    if (!contenido.trim()) {
      return { error: 'Mensaje vacío' };
    }

    const nuevoMensaje: Omit<Mensaje, "id"> = {
      idRemitente,
      idDestinatario,
      idPublicacion,
      contenido: contenido.trim(),
      fechaEnvio: Timestamp.now(),
      leido: false,
      participantes: [idRemitente, idDestinatario]
    };

    const idMensaje = await mensajeRepositorio.crearMensaje(nuevoMensaje);
    return { idMensaje };
  }

//Este no estaba, pero es mejor si lo hago desde el back y desde el front
  async obtenerYMarcarLeidos(idUsuario: string, idPublicacion: string) {
    const mensajes = await mensajeRepositorio.obtenerMensajes(idPublicacion, idUsuario);

    // Filtrar mensajes no leídos que fueron enviados AL usuario actual
    const mensajesNoLeidos = mensajes.filter(m => m.idDestinatario === idUsuario && !m.leido).map(m => m.id!);

    // si hay alguno elido, lo marco...
    if (mensajesNoLeidos.length > 0) {
      await mensajeRepositorio.marcarLeidos(mensajesNoLeidos);

      // Actualizo para q se vea
      mensajes.forEach(m => {
        if (mensajesNoLeidos.includes(m.id!)) {
          m.leido = true;
        }
      });
    }

    return {
      mensajes: mensajes.map(m => pasarADto(m))
    };
  }

  // para uso manual pr si las moscas
  async marcarLeidos(idsMensajes: string[]) {
    await mensajeRepositorio.marcarLeidos(idsMensajes);
    return { success: true };
  }
}

export default new MensajeServicio();