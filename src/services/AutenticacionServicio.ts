import bcrypt from "bcryptjs";
import { UsuarioRepositorio } from "../repository/UsuarioRepositorio";
import { ServicioJWT } from "./ServicioJWT";

export class AutenticacionServicio {

  static async login(correo: string, contrasena: string) {
    if (!correo || !contrasena) throw new Error("Complete todos los campos");

    const usuario = await UsuarioRepositorio.buscarPorCorreo(correo);
    if (!usuario) throw new Error("Usuario no registrado");

    const coincide = await bcrypt.compare(contrasena, usuario.contraseña);
    if (!coincide) throw new Error("Contraseña incorrecta");

    const token = ServicioJWT.generarToken(usuario);

    const rolPublico = usuario.rol.map(r => r.rolId);

    return { ID: usuario.id, rol: rolPublico, mail: usuario.correo, token };
  }
}
