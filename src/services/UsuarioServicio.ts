import { Usuario, PreferenciasUsuario, UsuarioConId } from "../models/Usuario";
import { UsuarioRepositorio } from "../repositories/UsuarioRepositorio";
import bcrypt from "bcryptjs";

export class UsuarioServicio {

  async registrar(datos: {
    nombreCompleto: string;
    correo: string;
    contraseña: string;
    edad: number;
    genero?: string;
    descripcion?: string;
    preferencias?: PreferenciasUsuario;
  }): Promise<{ id: string; nombreCompleto: string; correo: string }> {

    // Validaciones, segun chat no me conviene usar middlewares para esto,asiq....
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

    const usuario: Omit<UsuarioConId, "id"> = {
      nombreCompleto: datos.nombreCompleto,
      correo: datos.correo,
      contraseña: contraseñaHasheada,
      edad: datos.edad,
      rol: "USER_ROLE",
      fechaCreacion: new Date(),
      ...(datos.genero ? { genero: datos.genero } : {}),
      ...(datos.descripcion ? { descripcion: datos.descripcion } : {}),
      ...(datos.preferencias ? { preferencias: datos.preferencias } : {}),
    };


    const usuarioCreado = await UsuarioRepositorio.crear(usuario);

    return {
      id: usuarioCreado.id,
      nombreCompleto: usuarioCreado.nombreCompleto,
      correo: usuarioCreado.correo,
    };
  }
}
