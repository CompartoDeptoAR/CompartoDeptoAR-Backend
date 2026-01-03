import { Request, Response } from "express";
import { RequestConUsuarioId } from "../middlewares/validarUsuarioRegistrado";
import { RegistrarUsuarioDto } from "../dtos/registrarUsuarioDto";
import { UsuarioServicio } from "../services/UsuarioServicio";
import { validarEmail } from "../middlewares/validarEmail";
import { UsuarioRepositorio } from "../repository/UsuarioRepositorio";
import { db, admin } from "../config/firebase";
import { enviarCorreoBienvenida } from "../helpers/Correo";
import { Timestamp } from "firebase-admin/firestore";
import { Usuario } from "../models/Usuario";
import { AppError } from "../error/AppError";

export class UsuarioController {

  static async registrar(req: Request, res: Response) {
    let firebaseUid: string | null = null;
    const {correo,contraseña,nombreCompleto,edad,genero,descripcion,preferencias,habitos} = req.body;

    if (!correo || !contraseña || !nombreCompleto || !edad) {
      throw new AppError(
        "Faltan campos obligatorios: correo, contraseña, nombreCompleto, edad",
        400
      );
    }

    const validacion = await validarEmail(correo);
    if (!validacion.valido) {
      throw new AppError(`Email inválido: ${validacion.razon}`, 400);
    }

    const existente = await UsuarioRepositorio.buscarPorCorreo(correo);
    if (existente) {
      throw new AppError("El usuario ya está registrado", 400);
    }

    try {
      const userRecord = await admin.auth().createUser({
        email: correo,
        password: contraseña,
        displayName: nombreCompleto,
      });

      firebaseUid = userRecord.uid;

      const dto: RegistrarUsuarioDto = {
        correo,
        contraseña,
        firebaseUid,
        perfil: {
          nombreCompleto,
          edad,
          genero,
          descripcion,
          preferencias,
          habitos,
        },
      };

      const usuario: Usuario = {
        id: "",
        correo: dto.correo,
        contraseña: dto.contraseña,
        firebaseUid: dto.firebaseUid,
        rol: [],
        fechaCreacion: Timestamp.now(),
        perfil: dto.perfil,
        promedioCalificaciones: 0,
        cantidadCalificaciones: 0,
      };

      const usuarioCreado = await UsuarioRepositorio.crear(usuario);

      try {
        await enviarCorreoBienvenida(correo, nombreCompleto);
      } catch (e) {
        console.warn("No se pudo enviar correo de bienvenida", e);
      }

      return res.status(201).json({
        ok: true,
        mensaje: "Usuario registrado correctamente 😎",
        usuarioId: usuarioCreado.id,
      });

    } catch (error) {
      if (firebaseUid) {
        await admin.auth().deleteUser(firebaseUid);
      }
      throw error;
    }
  }

  static async eliminar(req: Request, res: Response) {
    const { id } = req.params;

    const ok = await UsuarioRepositorio.eliminar(id!);
    if (!ok) {
      throw new AppError("Usuario no encontrado", 404);
    }

    return res.json({
      mensaje: "Usuario eliminado y publicaciones asociadas eliminadas",
    });
  }


  static async eliminarMiCuenta(req: RequestConUsuarioId, res: Response) {
    const usuarioId = req.usuarioId;

    if (!usuarioId) {
      throw new AppError("No autenticado", 401);
    }

    await UsuarioRepositorio.eliminarCuentaUsuario(usuarioId);

    return res.status(200).json({
      mensaje: "Tu cuenta ha sido eliminada exitosamente",
      success: true,
    });
  }

  static async obtenerUsuarioPorId(req: Request, res: Response) {
    const { id } = req.params;

    if (!id) {
      throw new AppError("Falta el ID del usuario", 400);
    }

    const usuario = await UsuarioServicio.obtenerUsuarioPorId(id);
    return res.json(usuario);
  }

  static async obtenerPerfilDeUsuarioPorId(req: Request, res: Response) {
    const { id } = req.params;

    const usuario = await UsuarioServicio.obtenerUsuarioPorId(id!);
    if (!usuario) {
      throw new AppError("Usuario no encontrado", 404);
    }

    return res.status(200).json(usuario.perfil);
  }

  static async traerPerfil(req: RequestConUsuarioId, res: Response) {
    if (!req.usuarioId) {
      throw new AppError("Token inválido", 401);
    }

    const perfil = await UsuarioServicio.traerPerfil(req.usuarioId);
    return res.json(perfil);
  }

  // =========================
  // ACTUALIZAR PERFIL
  // =========================
  static async actualizarPerfil(req: RequestConUsuarioId, res: Response) {
    if (!req.usuarioId) {
      throw new AppError("Token inválido", 401);
    }

    await UsuarioServicio.actualizarPerfil(req.usuarioId, req.body);
    return res.status(200).json({ mensaje: "Perfil actualizado 😎" });
  }

  // =========================
  // LISTAR TODOS
  // =========================
  static async listarTodos(req: Request, res: Response) {
    await db.collection("usuarios").limit(1).get();

    const usuarios = await UsuarioServicio.listarTodos();
    const usuariosSeguros = usuarios.map(({ contraseña, ...resto }) => resto);

    return res.status(200).json({
      total: usuariosSeguros.length,
      usuarios: usuariosSeguros,
    });
  }

  // =========================
  // ASIGNAR ROL
  // =========================
  static async asignarRol(req: RequestConUsuarioId, res: Response) {
    const { usuarioId, rol } = req.body;

    if (!usuarioId || !rol) {
      throw new AppError("usuarioId y rol son requeridos", 400);
    }

    const usuario = await UsuarioRepositorio.buscarPorId(usuarioId);
    if (!usuario) {
      throw new AppError("Usuario no encontrado", 404);
    }

    await UsuarioServicio.asignarRol(usuarioId, rol);

    return res.json({
      mensaje: `El rol ${rol} fue asignado al usuario ${usuario.perfil.nombreCompleto}`,
    });
  }

  // =========================
  // SACAR ROL
  // =========================
  static async sacarRol(req: RequestConUsuarioId, res: Response) {
    const { usuarioId, rol } = req.body;

    if (!usuarioId || !rol) {
      throw new AppError("usuarioId y rol son requeridos", 400);
    }

    const usuario = await UsuarioRepositorio.buscarPorId(usuarioId);
    if (!usuario) {
      throw new AppError("Usuario no encontrado", 404);
    }

    await UsuarioServicio.sacarRol(usuarioId, rol);

    return res.json({
      mensaje: `Rol ${rol} sacado del usuario ${usuario.perfil.nombreCompleto}`,
    });
  }

  // =========================
  // OBTENER MI USUARIO
  // =========================
  static async obtenerMiUsuario(req: RequestConUsuarioId, res: Response) {
    if (!req.usuarioId) {
      throw new AppError("Token inválido", 401);
    }

    const usuario = await UsuarioServicio.obtenerUsuarioPorId(req.usuarioId);
    return res.json(usuario);
  }

  // =========================
  // HÁBITOS Y PREFERENCIAS
  // =========================
  static async obtenerHabitosYPreferencias(req: Request, res: Response) {
    const id = (req as any).usuarioId;

    if (!id) {
      throw new AppError("No se pudo obtener el usuario", 401);
    }

    const datos = await UsuarioServicio.obtenerHabitosYPreferencias(id);
    return res.status(200).json(datos);
  }
}
