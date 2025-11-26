import { Request, Response } from "express";
import { AutenticacionServicio } from "../services/AutenticacionServicio";
import { validarEmail } from "../services/emailValidator";

export class AuthController {
  static async login(req: Request, res: Response) {
  const { correo, contrasena } = req.body;
  const validacion = await validarEmail(correo);

  if (!validacion.valido) {
    return res.status(400).json({
      ok: false,
      mensaje: `Email invalido: ${validacion.razon}`
    });
  }
    try {
      const resultado = await AutenticacionServicio.login(correo, contrasena);
      res.status(200).json(resultado);
    } catch (error: any) {
      res.status(400).json({ mensaje: error.message });
    }
  }
}

//Aca tambien va el registrar, tengo q pasasrlo