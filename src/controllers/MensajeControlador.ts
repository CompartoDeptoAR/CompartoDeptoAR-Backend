import { Response } from 'express';
import mensajeServicio from '../services/MensajeServicio';
import { RequestConUsuarioId } from '../middlewares/validarUsuarioRegistrado';
import { AppError } from '../error/AppError';

class MensajeControlador {

  async enviarMensaje(req: RequestConUsuarioId, res: Response): Promise<void> {
    const usuarioId = req.usuarioId;
    const { idDestinatario, idPublicacion, contenido } = req.body;

    if (!usuarioId) {
      throw new AppError("Usuario no autenticado", 401);
    }

    if (!idDestinatario || !idPublicacion || !contenido) {
      throw new AppError("Faltan datos requeridos: idDestinatario, idPublicacion y contenido", 400);
    }

    const resultado = await mensajeServicio.enviarMensaje(usuarioId, idDestinatario, idPublicacion, contenido);

    if (resultado.error) {
      throw new AppError(resultado.error, 400);
    }

    res.json({ idMensaje: resultado.idMensaje });
  }

  async obtenerMensajes(req: RequestConUsuarioId, res: Response): Promise<void> {
    const usuarioId = req.usuarioId;
    const { idPublicacion } = req.params;

    if (!usuarioId) {
      throw new AppError("Usuario no autenticado", 401);
    }

    if (!idPublicacion) {
      throw new AppError("Falta el ID de la publicación", 400);
    }

    // ✅ OBTENER Y MARCAR AUTOMÁTICAMENTE COMO LEÍDOS
    const resultado = await mensajeServicio.obtenerYMarcarLeidos(usuarioId, idPublicacion);

    res.json({
      mensajes: resultado.mensajes,
      usuarioActualId: usuarioId
    });
  }

  // Endpoint opcional para marcar manualmente (por si lo necesitás desde notificaciones)
  async marcarLeidos(req: RequestConUsuarioId, res: Response): Promise<void> {
    const { idsMensajes } = req.body;

    if (!idsMensajes || !Array.isArray(idsMensajes) || idsMensajes.length === 0) {
      throw new AppError("Faltan IDs de mensajes o el formato es inválido", 400);
    }

    const resultado = await mensajeServicio.marcarLeidos(idsMensajes);
    res.json(resultado);
  }
}

export default new MensajeControlador();