import { pasarADto, UsuarioDto } from "../dtos/usuariosDto";
import { Usuario, UsuarioPerfil, PreferenciasUsuario, HabitosUsuario, UsuarioRol } from "../models/Usuario";
import { UsuarioRepositorio } from "../repositories/UsuarioRepositorio";
import bcrypt from "bcryptjs";

export interface RegistrarUsuarioDto {
  nombreCompleto: string;
  correo: string;
  contraseña: string;
  edad: number;
  genero?: string;
  descripcion?: string;
  preferencias?: PreferenciasUsuario;
  habitos?: HabitosUsuario;
}

export class UsuarioServicio {

  async registrar(datos: RegistrarUsuarioDto): Promise<UsuarioDto> {
    if (datos.descripcion && datos.descripcion.length > 500)
      throw { status: 400, message: "La descripcion es muy larga" };

    const usuarioExistente = await UsuarioRepositorio.buscarPorCorreo(datos.correo);
      if (usuarioExistente)
        throw { status: 409, message: "El correo ya está registrado" };

    const contraseñaHasheada = await bcrypt.hash(datos.contraseña, 10);

    const perfil: UsuarioPerfil = {
      nombreCompleto: datos.nombreCompleto,
      edad: datos.edad,
      ...(datos.genero ? { genero: datos.genero } : {}),
      ...(datos.descripcion ? { descripcion: datos.descripcion } : {}),
      ...(datos.preferencias ? { preferencias: datos.preferencias } : {}),
      ...(datos.habitos ? { habitos: datos.habitos } : {}),
    };

    const usuario: Omit<Usuario, "id"> = {
      correo: datos.correo,
      contraseña: contraseñaHasheada,
      rol: [
        {
          id: crypto.randomUUID(),
          //usuarioId: "",
          rolId: "USER_ROLE",
        },
      ],
      fechaCreacion: new Date(),
      perfil,
    };

    const usuarioCreado = await UsuarioRepositorio.crear(usuario);

    usuarioCreado.rol = usuarioCreado.rol.map((r) => ({
      ...r,
    }));

    await UsuarioRepositorio.actualizarRol(usuarioCreado.id, usuarioCreado.rol);

    return pasarADto(usuarioCreado);
  }
  //cuando traigo el perfil me tengo q acordar de omitir el id...
  async traerPerfil(usuarioId: string) {
    const usuario = await UsuarioRepositorio.buscarPorId(usuarioId);
    if (!usuario) throw new Error("Usuario no encontrado");
    const { perfil } = usuario;
    return perfil;
  }

  async actualizarPerfil(id: string, datos: Partial<UsuarioPerfil>): Promise<void> {
    await UsuarioRepositorio.actualizarPerfil(id, { perfil: datos });
  }

  async asignarRol(usuarioId: string, rolId: string): Promise<void> {
    const usuario = await UsuarioRepositorio.buscarPorId(usuarioId);
    if (!usuario) throw new Error("Usuario no encontrado");

    const yaTiene = usuario.rol?.some((r) => r.rolId === rolId);
    if (yaTiene) return;
    const nuevoRol: UsuarioRol = {
      id: crypto.randomUUID(),
      //usuarioId,
      rolId,
    };
    const rolesActualizados = [...(usuario.rol || []), nuevoRol];
    await UsuarioRepositorio.actualizarRol(usuarioId, rolesActualizados);
  }

  async sacarRol(usuarioId: string, rolId: string): Promise<void> {
    const usuario = await UsuarioRepositorio.buscarPorId(usuarioId);
    if (!usuario) throw new Error("Usuario no encontrado");

    const rolesActualizados = usuario.rol.filter((r) => r.rolId !== rolId);
    await UsuarioRepositorio.actualizarRol(usuarioId, rolesActualizados);
  }
}
