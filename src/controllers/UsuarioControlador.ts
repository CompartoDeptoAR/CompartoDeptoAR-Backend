import { Request, Response } from "express";
import { RequestConUsuarioId } from "../middlewares/validarUsuarioRegistrado";
import { RegistrarUsuarioDto } from "../dtos/registrarUsuarioDto";
import { UsuarioServicio } from "../services/UsuarioServicio";
import { validarEmail } from "../middlewares/validarEmail";
import { UsuarioRepositorio } from '../repository/UsuarioRepositorio';
import { db, admin } from "../config/firebase";

export class UsuarioController {

  static async registrar(req: Request, res: Response): Promise<any> {
    let firebaseUid: string | null = null;
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
      //console.log('Datos recibidos:', { correo, nombreCompleto, edad });
      if (!correo || !contraseña || !nombreCompleto || !edad) {
        return res.status(400).json({
          ok: false,
          mensaje: "Faltan campos obligatorios: correo, contraseña, nombreCompleto, edad"
        });
      }
      const validacion = await validarEmail(correo);
      if (!validacion.valido) {
        return res.status(400).json({
          ok: false,
          mensaje: `Email inválido: ${validacion.razon}`
        });
      }
      const existente = await UsuarioRepositorio.buscarPorCorreo(correo);
      if (existente) {
        return res.status(400).json({
          ok: false,
          mensaje: "El usuario ya está registrado"
        });
      }
      //console.log('Creando usuario en Firebase Auth...');
      const userRecord = await admin.auth().createUser({
        email: correo,
        password: contraseña,
        displayName: nombreCompleto,
      });

      firebaseUid = userRecord.uid;
      //console.log('Usuario creado en Firebase Auth:', firebaseUid);
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
      //console.log('Guardando usuario en Firestore...');
      const usuarioCreado = await UsuarioServicio.registrar(dto);
      //console.log(' Usuario registrado completamente en Firestore con ID:', usuarioCreado.id);

      return res.status(201).json({
        mensaje: "Usuario registrado correctamente 😎",
      });

    } catch (err: any) {
      //console.error('Error en registro:', err);
      if (firebaseUid) {
        try {
          await admin.auth().deleteUser(firebaseUid);
          console.log('🧹 Usuario limpiado de Firebase Auth debido al error');
        } catch (deleteError) {
          console.error('Error limpiando usuario de Firebase:', deleteError);
        }
      }

      return res.status(err.status || 500).json({
        ok: false,
        error: err.message || "Error interno del servidor"
      });
    }
  }

static async obtenerUsuarioPorId(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Falta el ID del usuario" });
    }
    const usuario = await UsuarioServicio.obtenerUsuarioPorId(id);
    return res.json(usuario);
  } catch (err: any) {
    return res.status(err.status || 500).json({ error: err.message });
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
      const id = req.user.id;
      const datos = await UsuarioServicio.obtenerHabitosYPreferencias(id!);

      res.status(200).json({...datos, });

    } catch (err: any) {
      res.status(err.status || 500).json({ error: err.message || "Error interno" });
    }
}

}