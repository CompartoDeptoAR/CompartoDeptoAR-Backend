import { Request, Response } from "express";
import { UsuarioServicio } from "../services/UsuarioServicio";
import { RequestConUsuarioId } from "../middlewares/validarUsuarioRegistrado";
import { db } from "../config/firebase";

const usuarioServicio = new UsuarioServicio();

export class UsuarioController {
  static async registrar(req: Request, res: Response) {
    try {
      const usuarioDto = await usuarioServicio.registrar(req.body);
      res.status(201).json({
        mensaje: "Usuario registrado 😎",
        usuario: usuarioDto,
      });
    } catch (err: any) {
      const status = err.status || 500;
      const mensaje = err.message || "Error interno del servidor";
      res.status(status).json({ error: mensaje });
    }
  }

  static async traerPerfil(req: RequestConUsuarioId, res: Response) {
    try {
      const usuarioId = req.usuarioId;
      if (!usuarioId) return res.status(401).json({ error: "Token inválido" });

      const perfil = await usuarioServicio.traerPerfil(usuarioId);
      return res.json(perfil);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Error interno" });
    }
  }

static async actualizarPerfil(req: RequestConUsuarioId, res: Response) {
  try {
    const usuarioId = req.usuarioId;
    const datosActualizados = req.body;

    if (!usuarioId) {
      return res.status(401).json({ error: "Token inválido" });
    }
    await usuarioServicio.actualizarPerfil(usuarioId, datosActualizados);
    res.status(200).json({ mensaje: "Perfil actualizado 😎" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
}
