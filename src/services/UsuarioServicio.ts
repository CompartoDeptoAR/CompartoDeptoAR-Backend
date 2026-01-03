import { pasarADto, UsuarioDto } from "../dtos/usuariosDto";
import { RegistrarUsuarioDto } from "../dtos/registrarUsuarioDto";
import { TipoRol } from "../models/tipoRol";
import {HabitosUsuario,PreferenciasUsuario,Usuario,UsuarioConId,UsuarioPerfil,UsuarioRol} from "../models/Usuario";
import { UsuarioRepositorio } from "../repository/UsuarioRepositorio";
import bcrypt from "bcryptjs";
import { Timestamp } from "firebase-admin/firestore";
import { admin } from "../config/firebase";
import { PublicacionRepositorio } from "../repository/PublicacionRepositorio";
import { CalificacionRepositorio } from "../repository/CalificacionRepositorio";
import { AppError } from "../error/AppError";

export class UsuarioServicio {

  static async validarContraseña(
    usuario: Usuario,
    contraseña: string
  ): Promise<boolean> {
    return bcrypt.compare(contraseña, usuario.contraseña);
  }


  static async registrar(datos: RegistrarUsuarioDto): Promise<UsuarioDto> {
    if (
      datos.perfil?.descripcion &&
      datos.perfil.descripcion.length > 500
    ) {
      throw new AppError("La descripción es muy larga", 400);
    }

    const usuarioExistente = await UsuarioRepositorio.buscarPorCorreo(datos.correo);
    if (usuarioExistente) {
      throw new AppError("El correo ya está registrado", 409);
    }

    const contraseñaHasheada = await bcrypt.hash(datos.contraseña, 10);

    const perfil: UsuarioPerfil = {
      nombreCompleto: datos.perfil.nombreCompleto,
      edad: datos.perfil.edad,
      ...(datos.perfil.genero && { genero: datos.perfil.genero }),
      ...(datos.perfil.descripcion && { descripcion: datos.perfil.descripcion }),
      ...(datos.perfil.preferencias && { preferencias: datos.perfil.preferencias }),
      ...(datos.perfil.habitos && { habitos: datos.perfil.habitos }),
    };

    const usuario: Usuario = {
      id: "",
      correo: datos.correo,
      contraseña: contraseñaHasheada,
      firebaseUid: datos.firebaseUid,
      rol: [
        {
          id: crypto.randomUUID(),
          rolId: TipoRol.USER_ROLE,
        },
      ],
      fechaCreacion: Timestamp.now(),
      perfil,
      promedioCalificaciones: 0,
      cantidadCalificaciones: 0,
    };

    const usuarioCreado: UsuarioConId =
      await UsuarioRepositorio.crear(usuario);

    return pasarADto(usuarioCreado);
  }


  static async eliminarCuentaUsuario(usuarioId: string): Promise<void> {
    const usuario = await UsuarioRepositorio.buscarPorId(usuarioId);
    if (!usuario) {
      throw new AppError("Usuario no encontrado", 404);
    }

    if (!usuario.firebaseUid) {
      throw new AppError("El usuario no tiene UID de Firebase", 400);
    }

    await admin.auth().deleteUser(usuario.firebaseUid);
    await PublicacionRepositorio.eliminarPorUsuario(usuarioId);
    await UsuarioRepositorio.eliminar(usuarioId);
  }


  static async traerPerfil(usuarioId: string): Promise<UsuarioPerfil> {
    const usuario = await UsuarioRepositorio.buscarPorId(usuarioId);
    if (!usuario) {
      throw new AppError("Usuario no encontrado", 404);
    }
    return usuario.perfil;
  }


  static async actualizarPerfil(
    id: string,
    datos: Partial<UsuarioPerfil>
  ): Promise<void> {
    await UsuarioRepositorio.actualizarPerfil(id, datos);
  }


  static async listarTodos(): Promise<Usuario[]> {
    return UsuarioRepositorio.listarTodos();
  }


  static async asignarRol(
    usuarioId: string,
    rol: TipoRol
  ): Promise<void> {
    const usuario = await UsuarioRepositorio.buscarPorId(usuarioId);
    if (!usuario) {
      throw new AppError("Usuario no encontrado", 404);
    }

    const yaTiene = usuario.rol?.some(r => r.rolId === rol);
    if (yaTiene) return;

    const nuevoRol: UsuarioRol = {
      id: crypto.randomUUID(),
      rolId: rol,
    };

    await UsuarioRepositorio.actualizarRol(
      usuarioId,
      [...(usuario.rol || []), nuevoRol]
    );
  }


  static async sacarRol(
    usuarioId: string,
    rol: TipoRol
  ): Promise<void> {
    const usuario = await UsuarioRepositorio.buscarPorId(usuarioId);
    if (!usuario) {
      throw new AppError("Usuario no encontrado", 404);
    }

    const rolesActualizados = usuario.rol.filter(
      r => r.rolId !== rol
    );

    if (rolesActualizados.length === usuario.rol.length) {
      throw new AppError(`El usuario no tiene el rol ${rol}`, 400);
    }

    await UsuarioRepositorio.actualizarRol(
      usuarioId,
      rolesActualizados
    );
  }


  static async obtenerUsuarioPorId(
    usuarioId: string
  ): Promise<UsuarioDto> {
    const usuario = await UsuarioRepositorio.buscarPorId(usuarioId);
    if (!usuario) {
      throw new AppError("Usuario no encontrado", 404);
    }
    return pasarADto(usuario);
  }


  static async actualizarEmail(
    usuarioId: string,
    nuevoEmail: string
  ): Promise<void> {
    const usuarioExistente =
      await UsuarioRepositorio.buscarPorCorreo(nuevoEmail);

    if (usuarioExistente && usuarioExistente.id !== usuarioId) {
      throw new AppError(
        "El correo ya está en uso por otro usuario",
        409
      );
    }

    await UsuarioRepositorio.actualizarPerfil(
      usuarioId,
      { correo: nuevoEmail } as any
    );
  }


  static async obtenerHabitosYPreferencias(
    usuarioId: string
  ): Promise<{
    habitos: HabitosUsuario | undefined;
    preferencias: PreferenciasUsuario | undefined;
  }> {
    if (!usuarioId) {
      throw new AppError("Falta el ID del usuario", 400);
    }

    const datos =
      await UsuarioRepositorio.obtenerHabitosYPreferencias(usuarioId);

    if (!datos) {
      throw new AppError("Usuario no encontrado", 404);
    }

    return datos;
  }


  static async obtenerSoloPromedio(
    idUsuario: string
  ): Promise<{ promedio: number; cantidad: number }> {
    const calificaciones =
      await CalificacionRepositorio.obtenerPorUsuario(idUsuario);

    const cantidad = calificaciones.length;
    const promedio = cantidad
      ? calificaciones.reduce((acc, c) => acc + c.puntuacion, 0) / cantidad
      : 0;

    return { promedio, cantidad };
  }
}
