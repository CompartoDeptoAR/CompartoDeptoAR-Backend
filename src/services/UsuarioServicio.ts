import { pasarADto, UsuarioDto } from "../dtos/usuariosDto";
import { RegistrarUsuarioDto } from "../dtos/registrarUsuarioDto";
import { TipoRol } from "../models/tipoRol";
import { HabitosUsuario, PreferenciasUsuario, Usuario, UsuarioConId, UsuarioPerfil, UsuarioRol } from "../models/Usuario";
import { UsuarioRepositorio } from "../repository/UsuarioRepositorio";
import bcrypt from "bcryptjs";
import { Timestamp } from "firebase-admin/firestore";

export class UsuarioServicio {

  static async validarContraseña(usuario: Usuario, contraseña: string): Promise<boolean> {
    return await bcrypt.compare(contraseña, usuario.contraseña);
  }

  static async registrar(datos: RegistrarUsuarioDto): Promise<UsuarioDto> {
    if (datos.perfil?.descripcion && datos.perfil.descripcion.length > 500) {
      throw { status: 400, message: "La descripcion es muy larga" };
    }
    const usuarioExistente = await UsuarioRepositorio.buscarPorCorreo(datos.correo);
    if (usuarioExistente) {
      throw { status: 409, message: "El correo ya esta registrado" };
    }
    const contraseñaHasheada = await bcrypt.hash(datos.contraseña, 10);

    const perfil: UsuarioPerfil = {
      nombreCompleto: datos.perfil.nombreCompleto,
      edad: datos.perfil.edad,
      ...(datos.perfil.genero ? { genero: datos.perfil.genero } : {}),
      ...(datos.perfil.descripcion ? { descripcion: datos.perfil.descripcion } : {}),
      ...(datos.perfil.preferencias ? { preferencias: datos.perfil.preferencias } : {}),
      ...(datos.perfil.habitos ? { habitos: datos.perfil.habitos } : {}),
    };

    const usuario: Omit<Usuario, "id"> = {
      correo: datos.correo,
      contraseña: contraseñaHasheada,
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
    const usuarioCreado = await UsuarioRepositorio.crear(usuario);
    usuarioCreado.rol = usuarioCreado.rol.map((r) => ({ ...r }));
    await UsuarioRepositorio.actualizarRol(usuarioCreado.id, usuarioCreado.rol);
    return pasarADto(usuarioCreado);
  }

  static async traerPerfil(usuarioId: string): Promise<UsuarioPerfil> {
    const usuario = await UsuarioRepositorio.buscarPorId(usuarioId);
    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }
    return usuario.perfil;
  }

  static async actualizarPerfil(id: string, datos: Partial<UsuarioPerfil>): Promise<void> {
    await UsuarioRepositorio.actualizarPerfil(id, { perfil: datos });
  }

  static async asignarRol(usuarioId: string, rol: TipoRol): Promise<void> {
    const usuario = await UsuarioRepositorio.buscarPorId(usuarioId);
    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }

    const yaTiene = usuario.rol?.some((r) => r.rolId === rol);
    if (yaTiene) {
      return;
    }
    const nuevoRol: UsuarioRol = {
      id: crypto.randomUUID(),
      rolId: rol,
    };

    const rolesActualizados = [...(usuario.rol || []), nuevoRol];
    await UsuarioRepositorio.actualizarRol(usuarioId, rolesActualizados);
  }

  static async sacarRol(usuarioId: string, rol: TipoRol): Promise<void> {
    const usuario = await UsuarioRepositorio.buscarPorId(usuarioId);
    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }

    const rolesActualizados = usuario.rol.filter((r) => r.rolId !== rol);
    await UsuarioRepositorio.actualizarRol(usuarioId, rolesActualizados);
  }

  static async obtenerUsuarioPorId(usuarioId: string): Promise<UsuarioDto> {
    const usuario = await UsuarioRepositorio.buscarPorId(usuarioId);
    if (!usuario) {
      throw { status: 404, message: "Usuario no encontrado" };
    }
    return pasarADto(usuario);
  }

  static async actualizarEmail(usuarioId: string, nuevoEmail: string): Promise<void> {
    const usuarioExistente = await UsuarioRepositorio.buscarPorCorreo(nuevoEmail);
    if (usuarioExistente && usuarioExistente.id !== usuarioId) {
      throw { status: 409, message: "El correo ya esta en uso por otro usuario" };
    }

    await UsuarioRepositorio.actualizarPerfil(usuarioId, { correo: nuevoEmail } as any);
  }

  static async obtenerHabitosYPreferencias(usuarioId: string): Promise<{habitos: HabitosUsuario | undefined;preferencias: PreferenciasUsuario | undefined;}>  {
  if (!usuarioId) {
    throw { status: 400, message: "Falta el ID del usuario" };
  }
  const datos = await UsuarioRepositorio.obtenerHabitosYPreferencias(usuarioId);
  if (!datos) {
    throw { status: 404, message: "Usuario no encontrado" };
  }
  return datos;
}

}