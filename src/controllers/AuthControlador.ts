import { Request, Response } from "express";
import admin from "../config/firebaseAdmin";
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
      console.error(err);
      return res.status(500).json({ error: err.message || "Error interno" });
    }
  }
  static async login(req: Request, res: Response) {
    try {
      const { correo, contraseña } = req.body;

      if (!correo || !contraseña) {
        return res.status(400).json({ error: "Falta correo o contraseña" });
      }

      const usuario = await UsuarioRepositorio.buscarPorCorreo(correo);
      if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

      const passOk = await UsuarioServicio.validarContraseña(usuario, contraseña);
      if (!passOk) return res.status(401).json({ error: "Contraseña incorrecta" });

      return res.status(200).json({
        ID: usuario.id,
        mail: usuario.correo,
        uid: usuario.firebaseUid,
        rol: usuario.rol.map(r => r.rolId)
      });

    } catch (err: any) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }
}
