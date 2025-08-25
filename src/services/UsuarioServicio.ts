//Me falta check q funcione aun jaja
import { pasarADto, UsuarioDto } from "../dtos/usuariosDto";
import { Usuario, UsuarioPerfil, PreferenciasUsuario, UsuarioConId, HabitosUsuario } from "../models/Usuario";
import { UsuarioRepositorio } from "../repositories/UsuarioRepositorio";
import bcrypt from "bcryptjs";

export interface RegistrarUsuarioDto{
  nombreCompleto: string;
  correo: string;
  contraseña: string;
  edad: number;
  genero: string;
  descripcion: string;
  habitos: HabitosUsuario;
}

export class UsuarioServicio {

    async registrar(datos: RegistrarUsuarioDto):Promise<UsuarioDto>{

      // Entiendo que no es reco poner middleware aca, pero nose Eze...
      if (datos.descripcion && datos.descripcion.length > 500)
        throw { status: 400, message: "La descripcion es demasiado larga" };

      const usuarioExistente = await UsuarioRepositorio.buscarPorCorreo(datos.correo);
      if (usuarioExistente)
        throw { status: 409, message: "El correo ya esta registrado" };

      const contraseñaHasheada = await bcrypt.hash(datos.contraseña, 10);

      const perfil: UsuarioPerfil = {
        nombreCompleto: datos.nombreCompleto,
        edad: datos.edad,
        ...(datos.genero ? { genero: datos.genero } : {}),
        ...(datos.descripcion ? { descripcion: datos.descripcion } : {}),
        ...(datos.habitos ? { preferencias: datos.habitos } : {}),
    };

      const usuario: Omit<Usuario, "id"> = {
      correo: datos.correo,
      contraseña: contraseñaHasheada,
      rol: "USER_ROLE",
      fechaCreacion: new Date(),
      perfil,
      };

      const usuarioCreado = await UsuarioRepositorio.crear(usuario);

      return  pasarADto(usuarioCreado)
  };

  async actualizarPerfil(id: string, perfil: UsuarioPerfil): Promise<void> {
    await UsuarioRepositorio.actualizarPerfil(id, perfil);
  }

}
