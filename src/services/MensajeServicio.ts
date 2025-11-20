import { Timestamp } from 'firebase-admin/firestore';
import mensajeRepositorio from '../repository/MensajeRepositorio';
import { Mensaje } from '../models/Mensaje';
import { pasarADto } from '../dtos/mensajeDto';

class MensajeServicio {
  async enviarMensaje(idRemitente: string, idDestinatario: string, idPublicacion: string, contenido: string) {
    if (!contenido.trim()) return { error: 'Mensaje vacío' };

  const nuevoMensaje: Omit<Mensaje, "id"> = {
    idRemitente,
    idDestinatario,
    idPublicacion,
    contenido: contenido.trim(),
    fechaHora: Timestamp.now(), // 👈 ESTA ES LA CORRECTA
    leido: false,
    participantes: [idRemitente, idDestinatario]
  };

const idMensaje = await mensajeRepositorio.crearMensaje(nuevoMensaje);
return { idMensaje };;
  }

async obtenerMensajes(idUsuario: string, idPublicacion: string) {
  const mensajes = await mensajeRepositorio.obtenerMensajes(idPublicacion, idUsuario);
  return {
    mensajes: mensajes.map(m => pasarADto(m))
  };
}

  async marcarLeidos(idsMensajes: string[]) {
    await mensajeRepositorio.marcarLeidos(idsMensajes);
    return { success: true };
  }
}

export default new MensajeServicio();