import { Request, Response } from "express";
import { RequestConUsuarioId } from "../middlewares/validarUsuarioRegistrado";
import { RegistrarUsuarioDto } from "../dtos/registrarUsuarioDto";
import { UsuarioServicio } from "../services/UsuarioServicio";
import { validarEmail } from "../middlewares/validarEmail";
import { UsuarioRepositorio } from '../repository/UsuarioRepositorio';
import { db, admin } from "../config/firebase";

export class UsuarioController {
static async registrar(req: Request, res: Response): Promise<any> {
  try {
    const {
      correo,
      contraseña,
      nombreCompleto,
      edad,
      genero,
      descripcion,
      preferencias,
      habitos
    } = req.body;
    const validacion = await validarEmail(correo);
    if (!validacion.valido) {
      return res.status(400).json({
        ok: false,
        mensaje: `Email invalido: ${validacion.razon}`
      });
    }
    const existente = await UsuarioRepositorio.buscarPorCorreo(correo);
    if (existente) {
      return res.status(400).json({
        ok: false,
        mensaje: "El usuario ya está registrado"
      });
    }
    const userRecord = await admin.auth().createUser({
      email: correo,
      password: contraseña,
      displayName: nombreCompleto,
    });
    const dto: RegistrarUsuarioDto = {
      correo,
      contraseña,
      firebaseUid: userRecord.uid,
      perfil: {
        nombreCompleto,
        edad,
        genero,
        descripcion,
        preferencias,
        habitos,
      }
    };
    //const usuarioCreado = await UsuarioServicio.registrar(dto);
    return res.status(201).json({
      mensaje: "Usuario registrado 😎",
      firebaseUid: userRecord.uid
    });

  } catch (err: any) {
    return res.status(err.status || 500).json({
      error: err.message || "Error interno"
    });
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
      const usuario = await UsuarioRepositorio.buscarPorId(usuarioId);
      await UsuarioServicio.asignarRol(usuarioId, rol);
      return res.json({
        mensaje: `El rol ${rol} fue asignado al usuario 👍 al usuario: ${usuario?.perfil.nombreCompleto} (${usuarioId}) 👍`
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
      const usuario = await UsuarioRepositorio.buscarPorId(usuarioId);
      await UsuarioServicio.sacarRol(usuarioId, rol);
      return res.json({
        mensaje: `Rol ${rol} quitado del usuario: ${usuario?.perfil.nombreCompleto} (${usuarioId}) 👍`
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

  static async obtenerHabitosYPreferencias(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const datos = await UsuarioServicio.obtenerHabitosYPreferencias(id!);

      res.status(200).json({...datos, });

    } catch (err: any) {
      res.status(err.status || 500).json({ error: err.message || "Error interno" });
    }
}

}