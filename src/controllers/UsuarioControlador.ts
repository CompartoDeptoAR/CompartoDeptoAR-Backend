//Esta es la primmer capa desde el back al front,entonces los DTOs deberian formarce aca,
//osea el controlador, es un patova.
import { Request, Response } from "express";
import { UsuarioServicio } from "../services/UsuarioServicio";
import { RequestConUsuarioId } from "../middlewares/validarUsuarioRegistrado";

const usuarioServicio = new UsuarioServicio();
//En realidad el usuarioDTO q creo en el servicio deberia de crearlo aca, pero lo acomodare desp...
export class UsuarioController {
  static async registrar(req: Request, res: Response):Promise<any>{
    try {
      const usuarioDto = await usuarioServicio.registrar(req.body);
      res.status(201).json({
        mensaje: "Usuario registrado 😎",
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
//Esto nomas es para los admin
 static async asignarRol(req: RequestConUsuarioId, res: Response) {
    try {
      const { usuarioId, rolId } = req.body;

      if (!usuarioId || !rolId) {
        return res.status(400).json({ error: "usuarioId y rolId son requeridos" });
      }
      await usuarioServicio.asignarRol(usuarioId, rolId);
      res.json({ mensaje: `Rol ${rolId} asignado al usuario ${usuarioId}` });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async sacarRol(req: RequestConUsuarioId, res: Response) {
    try {
      const { usuarioId, rolId } = req.body;

      if (!usuarioId || !rolId) {
        return res.status(400).json({ error: "usuarioId y rolId son " });
      }
      await usuarioServicio.sacarRol(usuarioId, rolId);
      res.json({ mensaje: `Rol ${rolId} quitado del usuario ${usuarioId}` });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

}