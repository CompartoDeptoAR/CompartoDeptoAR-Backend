import { Request, Response } from "express";
import { UsuarioServicio } from "../services/UsuarioServicio";

const usuarioServicio = new UsuarioServicio();

export class UsuarioController {
  static async registrar(req: Request, res: Response) {
    try {
      const resultado = await usuarioServicio.registrar(req.body);
      res.status(201).json({
        mensaje: "Usuario registrado 😎",
        usuario: resultado,
      });
    } catch (err: any) {
      const status = err.status || 500;
      const mensaje = err.message || "Error interno del servidor";
      res.status(status).json({ error: mensaje });
    }
  }

  static async actualizarPerfil(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const perfil = req.body;

      if (!id) {
        res.status(400).json({ error: "ID es obligatorio" });
      }

      await usuarioServicio.actualizarPerfil(id!, perfil);
      res.status(200).json({ mensaje: "Perfil actualizado 😎" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
