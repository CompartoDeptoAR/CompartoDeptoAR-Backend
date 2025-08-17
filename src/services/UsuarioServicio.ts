import { Usuario, UsuarioPerfil, PreferenciasUsuario, UsuarioConId } from "../models/Usuario";
import { UsuarioRepositorio } from "../repositories/UsuarioRepositorio";
import bcrypt from "bcryptjs";

export class UsuarioServicio {
  // Registrar usuario nuevo
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
    if (!datos.nombreCompleto || datos.nombreCompleto.length < 3)
      throw { status: 400, message: "El nombre completo es inválido" };

    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!datos.correo || !regexCorreo.test(datos.correo))
      throw { status: 400, message: "El correo es inválido" };

    const regexContraseña = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!datos.contraseña || !regexContraseña.test(datos.contraseña))
      throw { status: 400, message: "La contraseña es inválida" };

    if (!datos.edad || datos.edad < 18)
      throw { status: 400, message: "La edad debe ser mayor o igual a 18" };

    if (datos.descripcion && datos.descripcion.length > 500)
      throw { status: 400, message: "La descripción es demasiado larga" };

    const usuarioExistente = await UsuarioRepositorio.buscarPorCorreo(datos.correo);
    if (usuarioExistente)
      throw { status: 409, message: "El correo ya está registrado" };

    const contraseñaHasheada = await bcrypt.hash(datos.contraseña, 10);

    const usuario = {
      nombreCompleto: datos.nombreCompleto,
      correo: datos.correo,
      contraseña: contraseñaHasheada,
      edad: datos.edad,
      rol: "USER_ROLE",
      fechaCreacion: new Date(),
      ...(datos.genero ? { genero: datos.genero } : {}),
      ...(datos.descripcion ? { descripcion: datos.descripcion } : {}),
      ...(datos.preferencias ? { preferencias: datos.preferencias } : {}),
    } as unknown as Omit<UsuarioConId, "id">;

    const usuarioCreado = await UsuarioRepositorio.crear(usuario);

    return {
      id: usuarioCreado.id,
      nombreCompleto: usuarioCreado.perfil.nombreCompleto,
      correo: usuarioCreado.correo,
    };
  }

  async crearPerfil(id: string, perfil: UsuarioPerfil): Promise<void> {
    this.validarPerfil(perfil);
    await UsuarioRepositorio.crearPerfil(id, perfil);
  }

  async actualizarPerfil(id: string, perfil: UsuarioPerfil): Promise<void> {
    this.validarPerfil(perfil);
    await UsuarioRepositorio.actualizarPerfil(id, perfil);
  }

  private validarPerfil(perfil: UsuarioPerfil) {
    if (!perfil.nombreCompleto || perfil.nombreCompleto.trim() === "")
      throw { status: 400, message: "El nombre completo es obligatorio" };

    if (!perfil.edad || perfil.edad < 18)
      throw { status: 400, message: "Tenes que tener 18 o mas." };

    if (perfil.descripcion && perfil.descripcion.length > 500)
      throw { status: 400, message: "No te copes, no podes superar los 500 caracteres" };
  }
}
