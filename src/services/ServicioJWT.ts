import jwt from "jsonwebtoken";
import { UsuarioConId } from "../models/Usuario";

//funciones sincronas xq no estoy manejando miles de tokens por segundo...caso cerradonp

export class ServicioJWT {
  private static readonly SECRETO = process.env.JWT_SECRET || "unSecreto";
  private static readonly TIEMPO_EXPIRACION_MS = 24 * 60 * 60 * 1000;

  static generarToken(usuario: UsuarioConId): string {
    const datos = {
      uid: usuario.id,
      correo: usuario.correo,
    };
    const token = jwt.sign(datos, ServicioJWT.SECRETO, {
      algorithm: "HS256",
      expiresIn: ServicioJWT.TIEMPO_EXPIRACION_MS / 1000,
    });
    return token;
  }

  static extraerDatos(token: string) {
    try {
      return jwt.verify(token, ServicioJWT.SECRETO) as { uid: string; correo: string; iat: number; exp: number };
    } catch {
      return null;
    }
  }

  static extraerIdUsuario(token: string): string | null {
    const datos = ServicioJWT.extraerDatos(token);
    return datos ? datos.uid : null;
  }

  // Chek q no haya expirado
  static validarToken(token: string): boolean {
    try {
      const datos = ServicioJWT.extraerDatos(token);
      if (!datos) return false;
      const ahora = Date.now() / 1000;
      return datos.exp > ahora;
    } catch {
      return false;
    }
  }
}