import { Usuario, PreferenciasUsuario } from "../models/Usuario";
import { UsuarioRepositorio } from "../repositories/UsuarioRepositorio";
import bcrypt from "bcryptjs";

export class UsuarioServicio {
  private usuarioRepo = new UsuarioRepositorio();

  async registrar(datos: {
    nombreCompleto: string;
    correo: string;
    contraseña: string;
    edad: number;
    genero?: string;
    descripcion?: string;
    preferencias?: PreferenciasUsuario;
  }): Promise<{ id: string; nombreCompleto: string; correo: string }> {

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

    const usuarioExistente = await this.usuarioRepo.buscarPorCorreo(datos.correo);
    if (usuarioExistente) throw { status: 409, message: "El correo ya está registrado" };


    const contraseñaHasheada = await bcrypt.hash(datos.contraseña, 10);


    const usuario: Usuario = {
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

    const id = await this.usuarioRepo.crear(usuario);

    return { id, nombreCompleto: usuario.nombreCompleto, correo: usuario.correo };
  }
}
