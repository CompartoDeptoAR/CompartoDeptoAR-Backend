import { Request, Response } from "express";
import { mandarMensaje, obtenerMensajes } from "../services/ChatServicio";
import { RequestConUsuarioId } from "../middlewares/validarUsuarioRegistrado";

export class ChatController {

  static async mandar(req: Request, res: Response) {
    try {
      const remitenteId = (req as any).usuarioId;
      const {destinatarioId, texto } = req.body;

      const mensaje = await mandarMensaje(remitenteId, destinatarioId, texto);

      res.status(201).json({ mensaje: "Mensaje enviado 😎", data: mensaje.texto });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
//esta es solamente para chequear en postman eh
static async obtener(req: RequestConUsuarioId, res: Response) {
    try {
      const usuarioId = req.usuarioId;
      const mensajes = await obtenerMensajes(String(usuarioId));

      res.status(200).json({ mensajes });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Error interno" });
    }
  }


}