import { Request, Response } from "express";
import { RequestConUsuarioId } from "../middlewares/validarUsuarioRegistrado";
import { RegistrarUsuarioDto } from "../dtos/registrarUsuarioDto";
import { UsuarioServicio } from "../services/UsuarioServicio";
import { validarEmail } from "../services/emailValidator";

export class UsuarioController {

  static async registrar(req: Request, res: Response): Promise<any> {
    try {
      const validacion = await validarEmail(req.body.correo);

      if (!validacion.valido) {
        return res.status(400).json({
          ok: false,
          mensaje: `Email invalido: ${validacion.razon}`
        });
      }
      const dto: RegistrarUsuarioDto = {
        correo: req.body.correo,
        contraseña: req.body.contraseña,
        nombreCompleto: req.body.nombreCompleto,
        edad: req.body.edad,
        genero: req.body.genero,
        descripcion: req.body.descripcion,
        preferencias: req.body.preferencias,
        habitos: req.body.habitos,
      };
      const usuarioCreado = await UsuarioServicio.registrar(dto);
      res.status(201).json({
        mensaje: "Usuario registrado 😎",
      });

    } catch (err: any) {
      res.status(err.status || 500).json({ error: err.message || "Error interno" });
    }
  }

  static async traerPerfil(req: RequestConUsuarioId, res: Response): Promise<Response> {
    try {
      const usuarioId = req.usuarioId;
      if (!usuarioId) {
        return res.status(401).json({ error: "Token invalido" });
      }
      const perfil = await UsuarioServicio.traerPerfil(usuarioId);
      return res.json(perfil);

    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Error interno" });
    }
  }

  static async actualizarPerfil(req: RequestConUsuarioId, res: Response): Promise<Response> {
    try {
      const usuarioId = req.usuarioId;
      const datosActualizados = req.body;

      if (!usuarioId) {
        return res.status(401).json({ error: "Token invalido" });
      }

      await UsuarioServicio.actualizarPerfil(usuarioId, datosActualizados);
      return res.status(200).json({ mensaje: "Perfil actualizado 😎" });

    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async asignarRol(req: RequestConUsuarioId, res: Response): Promise<Response> {
    try {
      const { usuarioId, rol } = req.body;

      if (!usuarioId || !rol) {
        return res.status(400).json({ error: "usuarioId y rol son requeridos" });
      }

      await UsuarioServicio.asignarRol(usuarioId, rol);
      return res.json({
        mensaje: `El rol ${rol} fue asignado al usuario 👍 al usuario ${usuarioId}`
      });

    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async sacarRol(req: RequestConUsuarioId, res: Response): Promise<Response> {
    try {
      const { usuarioId, rol } = req.body;

      if (!usuarioId || !rol) {
        return res.status(400).json({ error: "usuarioId y rolId son requeridos" });
      }

      await UsuarioServicio.sacarRol(usuarioId, rol);
      return res.json({
        mensaje: `Rol ${rol} quitado del usuario ${usuarioId}`
      });

    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async obtenerMiUsuario(req: RequestConUsuarioId, res: Response): Promise<Response> {
    try {
      const usuarioId = req.usuarioId;
      if (!usuarioId) {
        return res.status(401).json({ error: "Token invalido" });
      }

      const usuario = await UsuarioServicio.obtenerUsuarioPorId(usuarioId);
      return res.json(usuario);

    } catch (err: any) {
      return res.status(err.status || 500).json({ error: err.message });
    }
  }
}