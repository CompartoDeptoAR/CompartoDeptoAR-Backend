import { Request, Response } from "express";
import { db, admin } from "../config/firebase";
import { UsuarioRepositorio } from "../repository/UsuarioRepositorio";
import { UsuarioServicio } from "../services/UsuarioServicio";

export class AuthController {
  static async registrar(req: Request, res: Response) {
    try {
      const { correo, contraseña, nombreCompleto, edad, genero, descripcion, preferencias, habitos } = req.body;

      if (!correo || !contraseña) {
        return res.status(400).json({ ok: false, mensaje: "Falta correo o contraseña" });
      }

      const existente = await UsuarioRepositorio.buscarPorCorreo(correo);
      if (existente) {
        return res.status(400).json({ ok: false, mensaje: "El usuario ya está registrado" });
      }
      const userRecord = await admin.auth().createUser({ email: correo, password: contraseña });

      const dto = {
        correo,
        contraseña,
        firebaseUid: userRecord.uid,
        perfil: {
          nombreCompleto,
          edad,
          genero,
          descripcion,
          preferencias,
          habitos,
        }
      };

      const usuarioCreado = await UsuarioServicio.registrar(dto);

      return res.status(201).json({
        ok: true,
        mensaje: "Usuario registrado 😎",
        ID: usuarioCreado.id,
        uid: userRecord.uid
      });

    } catch (err: any) {
      console.error("Error en registro:", err);
      return res.status(500).json({ error: err.message || "Error interno" });
    }
  }

  static async login(req: Request, res: Response): Promise<Response> {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        return res.status(400).json({ error: "Falta idToken" });
      }
      const decoded = await admin.auth().verifyIdToken(idToken);
      const email = decoded.email;
      const uid = decoded.uid;

      if (!email) {
        return res.status(400).json({ error: "El token no contiene un correo válido" });
      }

      const usuario = await UsuarioRepositorio.buscarPorCorreo(email);
      if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado en la base de datos" });
      }

      return res.status(200).json({
        ID: usuario.id,
        mail: usuario.correo,
        uid: uid,
        rol: usuario.rol.map(r => r.rolId),
      });

    } catch (err: any) {
      console.error("Error en login Firebase:", err);
      return res.status(500).json({ error: err.message || "Error interno al iniciar sesión" });
    }
  }
}
