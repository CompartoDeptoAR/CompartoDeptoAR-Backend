import { RecuperacionRepository } from "../repository/RecuperacionRepositorio";
import { UsuarioRepositorio } from "../repository/UsuarioRepositorio";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { enviarCorreoRecuperacion } from "../helpers/Correo";

export class RecuperacionService {

  static async solicitarRecuperacion(correo: string): Promise<string> {
    const usuario = await UsuarioRepositorio.buscarPorCorreo(correo);
    if (!usuario) throw { status: 404, message: "Correo no registrado" };

    const token = crypto.randomBytes(32).toString("hex");
    const expiracion = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos

    await RecuperacionRepository.guardarToken(correo, token, expiracion);
    await enviarCorreoRecuperacion(correo, token);

    return "Se envió un enlace de recuperación a tu correo 📩";
  }

  static async restablecerContrasenia(token: string, nuevaContrasenia: string): Promise<string> {
    const registro = await RecuperacionRepository.obtenerPorToken(token);
    if (!registro) throw { status: 400, message: "Enlace inválido" };
    if (registro.usado) throw { status: 400, message: "Este enlace ya fue utilizado" };
    if (new Date() > registro.expiracion.toDate()) throw { status: 400, message: "El enlace expiró" };

    const hash = await bcrypt.hash(nuevaContrasenia, 10);
    await UsuarioRepositorio.actualizarContraseniaPorCorreo(registro.correo, hash);
    await RecuperacionRepository.marcarComoUsado(token);

    return "Contraseña actualizada correctamente 😎";
  }
}
