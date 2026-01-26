import { Request, Response } from "express";
import { RecuperacionService } from "../services/RecuperacionServicio";
import { AppError } from "../error/AppError";

//Todavia no le esta (?
export class RecuperacionController {

  static async solicitarRecuperacion(req: Request, res: Response): Promise<void> {
    //console.log("BODY recibido:", req.body);
    const { correo } = req.body;
    //console.log("Correo recibido:", correo);

    if (!correo) {
      throw new AppError("El correo es obligatorio", 400);
    }

    const mensaje = await RecuperacionService.solicitarRecuperacion(correo);
    res.status(200).json({ mensaje });
  }

  static async restablecerContrasenia(req: Request, res: Response): Promise<void> {
    const { token, nuevaContrasenia } = req.body;

    if (!token || !nuevaContrasenia) {
      throw new AppError("Token y nueva contraseña son obligatorios", 400);
    }

    const mensaje = await RecuperacionService.restablecerContrasenia(token, nuevaContrasenia);
    res.status(200).json({ mensaje });
  }
}