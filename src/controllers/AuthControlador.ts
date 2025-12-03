import { Request, Response } from "express";
import { admin } from "../config/firebase";
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

    let usuarioReg;

    try {
      usuarioReg = await admin.auth().createUser({
        email: correo.trim(),
        password: contraseña
      });
    } catch (firebaseErr: any) {
      console.error("🔥 ERROR CREANDO USUARIO EN FIREBASE:");
      console.error("Código:", firebaseErr.code);
      console.error("Mensaje:", firebaseErr.message);
      console.error("Stack:", firebaseErr.stack);
      return res.status(500).json({
        ok: false,
        error: firebaseErr.message || "Error al crear usuario en Firebase",
        code: firebaseErr.code
      });
    }

    const dto = {
      correo: correo.trim(),
      contraseña,
      firebaseUid: usuarioReg.uid,
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
      uid: usuarioReg.uid
    });

  } catch (err: any) {
    console.error("Error en registro:", err);
    return res.status(500).json({ error: err.message || "Error interno" });
  }
}


static async login(req: Request, res: Response): Promise<Response> {
  try {
    console.log("[LOGIN] Iniciando login...");
    console.log("[LOGIN] Headers:", req.headers);
    console.log("[LOGIN] Body completo:", req.body);
    console.log("[LOGIN] Body.idToken:", req.body.idToken);
    console.log("[LOGIN] Body.idToken type:", typeof req.body.idToken);

    const { idToken } = req.body;

    if (!idToken) {
      console.log("[LOGIN] No se recibió idToken");
      return res.status(400).json({ error: "Se requiere idToken de Firebase" });
    }

    console.log("[LOGIN] Verificando token Firebase...");
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
      console.log("[LOGIN] Token verificado correctamente");
    } catch (firebaseError: any) {
      console.error("[LOGIN] Error verificando token:", firebaseError);

      if (firebaseError.code === 'auth/id-token-expired') {
        return res.status(401).json({ error: "Token expirado. Inicia sesión nuevamente" });
      }
      if (firebaseError.code === 'auth/argument-error') {
        return res.status(400).json({ error: "Token inválido" });
      }
      if (firebaseError.code === 'auth/user-disabled') {
        return res.status(403).json({ error: "Usuario deshabilitado" });
      }

      return res.status(401).json({ error: "Token de autenticación inválido" });
    }

    const email = decodedToken.email;
    if (!email) {
      console.log("[LOGIN] Token no contiene email");
      return res.status(400).json({ error: "El token no contiene información de email" });
    }

    console.log("[LOGIN] Buscando usuario con email:", email);

    const usuario = await UsuarioRepositorio.buscarPorCorreo(email);
    if (!usuario) {
      console.log("[LOGIN] Usuario no encontrado en BD para email:", email);
      return res.status(404).json({ error: "Usuario no registrado en el sistema" });
    }

    console.log("[LOGIN] Login exitoso. Usuario ID:", usuario.id);

    return res.status(200).json({
      ID: usuario.id,
      mail: usuario.correo,
      uid: decodedToken.uid || usuario.firebaseUid || "",
      rol: usuario.rol.map(r => r.rolId),
      nombre: usuario.perfil?.nombreCompleto || "",
    });

  } catch (error: any) {

    console.error("[LOGIN] Error interno del servidor:", error);
    console.error("Stack trace:", error.stack);

    return res.status(500).json({
      error: "Error interno del servidor al procesar login",
      message: error.message
    });
  }
}
}
