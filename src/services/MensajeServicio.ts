import mensajeRepositorio from '../repository/MensajeRepositorio';

class MensajeServicio {
  async enviarMensaje(idRemitente: string, idDestinatario: string, idPublicacion: string, contenido: string) {
    if (!contenido.trim()) return { error: 'Mensaje vacío' };

    const nuevoMensaje = {
      idRemitente, idDestinatario, idPublicacion,
      contenido: contenido.trim(), fechaHora: new Date(),
      leido: false, participantes: [idRemitente, idDestinatario]
    };

    const idMensaje = await mensajeRepositorio.crearMensaje(nuevoMensaje);
    return { idMensaje };
  }

  async obtenerMensajes(idUsuario: string, idPublicacion: string) {
    const mensajes = await mensajeRepositorio.obtenerMensajes(idPublicacion, idUsuario);
    return { mensajes };
  }

  async marcarLeidos(idsMensajes: string[]) {
    await mensajeRepositorio.marcarLeidos(idsMensajes);
    return { success: true };
  }
}

export default new MensajeServicio();