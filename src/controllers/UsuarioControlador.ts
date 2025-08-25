import { Request, Response } from "express";
import { UsuarioServicio } from "../services/UsuarioServicio";
import { ServicioJWT } from "../services/ServicioJWT";

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

   static async traerPerfil(req: Request, res: Response) {
    try {
      const tokenHeader = req.headers.authorization;
      if (!tokenHeader) return res.status(401).json({ error: "Tenes que iniciar sesion" });

      const token = tokenHeader.split(" ")[1];
      if (!token || !ServicioJWT.validarToken(token)) {
        return res.status(401).json({ error: "Token invalido o expirado" });
      }

      const usuarioId = ServicioJWT.extraerIdUsuario(token);
      if (!usuarioId) return res.status(401).json({ error: "Token invalido" });

      const perfil = await usuarioServicio.traerPerfil(usuarioId);
      return res.json(perfil);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Error interno" });
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
