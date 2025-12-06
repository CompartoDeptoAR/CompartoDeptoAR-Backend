import { Response } from 'express';
import mensajeServicio from '../services/MensajeServicio';
import { RequestConUsuarioId } from '../middlewares/validarUsuarioRegistrado';

class MensajeControlador {
  async enviarMensaje(req: RequestConUsuarioId, res: Response) {
    try {
      const { idDestinatario, idPublicacion, contenido } = req.body;
      const resultado = await mensajeServicio.enviarMensaje(req.usuarioId!, idDestinatario, idPublicacion, contenido);
     // console.log('ver:', resultado);
      res.json(resultado.error ? { error: resultado.error } : { idMensaje: resultado.idMensaje });
    } catch (error) {
      console.error('ERROR en enviarMensaje:', error);
      res.status(500).json({ error: 'Error interno' });
    }
  }

  async obtenerMensajes(req: RequestConUsuarioId, res: Response) {
    try {
      const resultado = await mensajeServicio.obtenerMensajes(
        req.usuarioId!,
        String(req.params.idPublicacion)
      );

      res.json({
        mensajes: resultado.mensajes,
        usuarioActualId: req.usuarioId!
      });

    } catch (error) {
      res.status(500).json({ error: 'Error interno' });
    }
  }

  async marcarLeidos(req: RequestConUsuarioId, res: Response) {
    try {
      const resultado = await mensajeServicio.marcarLeidos(req.body.idsMensajes);
      res.json(resultado);
    } catch (error) {
      res.status(500).json({ error: 'Error interno' });
    }
  }
}

export default new MensajeControlador();