import { Request, Response } from "express";
import { RecuperacionService } from "../services/RecuperacionServicio";

export class RecuperacionController {
  static async solicitarRecuperacion(req: Request, res: Response): Promise<Response> {
    try {
      //console.log("BODY recibido:", req.body);
      const { correo } = req.body;
      //console.log("Correo recibido:", correo);
      const mensaje = await RecuperacionService.solicitarRecuperacion(correo);
      return res.status(200).json({ mensaje });
    } catch (err: any) {
      return res.status(err.status || 500).json({ error: err.message || "Error al solicitar recuperacion" });
    }
  }

  static async restablecerContrasenia(req: Request, res: Response): Promise<Response> {
    try {
      const { token, nuevaContrasenia } = req.body;
      const mensaje = await RecuperacionService.restablecerContrasenia(token, nuevaContrasenia);
      return res.status(200).json({ mensaje });
    } catch (err: any) {
      return res.status(err.status || 500).json({ error: err.message || "Error al restablecer contraseña" });
    }
  }
}
