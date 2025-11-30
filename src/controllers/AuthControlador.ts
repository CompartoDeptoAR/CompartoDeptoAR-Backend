import { Request, Response } from "express";
import { db, admin } from "../config/firebase";
import { UsuarioRepositorio } from "../repository/UsuarioRepositorio";
import { UsuarioServicio } from "../services/UsuarioServicio";
import bcrypt from "bcrypt";

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
    //console.log("Iniciando proceso de login...");
    //console.log("Body recibido:", req.body);
    const { correo, contraseña } = req.body;

    if (!correo || !contraseña) {
      //console.log("Faltan credenciales");
      return res.status(400).json({ error: "Faltan correo o contraseña" });
    }

    //console.log("Buscando usuario en BD con email:", correo);

    const usuario = await UsuarioRepositorio.buscarPorCorreo(correo);

    if (!usuario) {
      //console.log("Usuario no encontrado en BD");
      return res.status(401).json({ error: "Credenciales inválidas" });
    }
    //console.log("Usuario encontrado, verificando contraseña...");
    const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña);

    if (!contraseñaValida) {
      //console.log("Contraseña incorrecta");
      return res.status(401).json({ error: "Credenciales inválidas" });
    }
    //console.log("Login exitoso para usuario:", usuario.id);
    return res.status(200).json({
      ID: usuario.id,
      mail: usuario.correo,
      rol: usuario.rol.map(r => r.rolId),
      nombre: usuario.perfil?.nombreCompleto,
    });

  } catch (err: any) {
    //console.error("Error en login:", err);
    return res.status(500).json({ error: "Error interno al iniciar sesión" });
  }
}
}
