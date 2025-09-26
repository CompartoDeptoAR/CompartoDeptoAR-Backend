import { Request, Response } from "express";
import { AutenticacionServicio } from "../services/AutenticacionServicio";

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { correo, contrasena } = req.body;
      const resultado = await AutenticacionServicio.login(correo, contrasena);
      res.status(200).json(resultado);
    } catch (error: any) {
      res.status(400).json({ mensaje: error.message });
    }
  }
}

//Aca tambien va el registrar, tengo q pasasrlo