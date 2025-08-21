import { Usuario, UsuarioPerfil, PreferenciasUsuario, UsuarioConId } from "../models/Usuario";
import { UsuarioRepositorio } from "../repositories/UsuarioRepositorio";
import bcrypt from "bcryptjs";

export class UsuarioServicio {
  static crearPerfil(id: string | undefined, perfil: any) {
    throw new Error("Method not implemented.");
  }
  static actualizarPerfil(id: string | undefined, perfil: any) {
    throw new Error("Method not implemented.");
  }

    async registrar(datos: {
      nombreCompleto: string;
      correo: string;
      contraseña: string;
      edad: number;
      genero?: string;
      descripcion?: string;
      preferencias?: PreferenciasUsuario;
    }): Promise<{ id: string; nombreCompleto: string; correo: string }> {

    // Entiendo que no es reco poner middleware aca, pero nose Eze...
    if (datos.descripcion && datos.descripcion.length > 500)
      throw { status: 400, message: "La descripción es demasiado larga" };

    const usuarioExistente = await UsuarioRepositorio.buscarPorCorreo(datos.correo);
    if (usuarioExistente)
      throw { status: 409, message: "El correo ya esta registrado" };

    const contraseñaHasheada = await bcrypt.hash(datos.contraseña, 10);

    const perfil: UsuarioPerfil = {
      nombreCompleto: datos.nombreCompleto,
      edad: datos.edad,
      ...(datos.genero ? { genero: datos.genero } : {}),
      ...(datos.descripcion ? { descripcion: datos.descripcion } : {}),
      ...(datos.preferencias ? { preferencias: datos.preferencias } : {}),
    };


    const usuario: Omit<Usuario, "id"> = {
    correo: datos.correo,
    contraseña: contraseñaHasheada,
    rol: "USER_ROLE",
    fechaCreacion: new Date(),
    perfil,
    };

    const usuarioCreado = await UsuarioRepositorio.crear(usuario);

    return {
      id: usuarioCreado.id,
      nombreCompleto: usuarioCreado.perfil.nombreCompleto,
      correo: usuarioCreado.correo,
    };
  }

  async actualizarPerfil(id: string, perfil: UsuarioPerfil): Promise<void> {
    await UsuarioRepositorio.actualizarPerfil(id, perfil);
  }

}
