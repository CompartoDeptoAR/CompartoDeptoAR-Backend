import { NextFunction, Request, Response } from "express";
import { UsuarioRepositorio } from "../repository/UsuarioRepositorio";
import admin from "firebase-admin";

export interface RequestConUsuarioId extends Request {
  usuarioId?: string | null;
}

export async function validarUsuariosRegistrados(req: RequestConUsuarioId,res: Response,next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "Tenés que iniciar sesión" });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token!);
    const firebaseUid = decodedToken.uid;
    const email = decodedToken.email;

    if (!email) {
      return res.status(401).json({ error: "Token no contiene email" });
    }

    const usuario = await UsuarioRepositorio.buscarPorCorreo(email);

    if (!usuario) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }
    req.usuarioId = usuario.id;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ error: "Token inválido" });
  }
}