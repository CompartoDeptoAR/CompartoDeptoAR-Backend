import { NextFunction, Request, Response } from "express";
import { UsuarioRepositorio } from "../repository/UsuarioRepositorio";

export interface RequestConUsuarioId extends Request {
  usuarioId?: string | null;
}

export async function validarUsuariosRegistrados(
  req: RequestConUsuarioId,
  res: Response,
  next: NextFunction
) {
  const usuarioId = req.headers["x-user-id"] as string | undefined;

  if (!usuarioId) {
    return res.status(401).json({ error: "Tenés que iniciar sesión" });
  }

  //existe o no en la bd? esa es la cuestion
  const usuario = await UsuarioRepositorio.buscarPorId(usuarioId);
  if (!usuario) return res.status(401).json({ error: "Usuario no encontrado" });

  req.usuarioId = usuarioId;
  next();
}
