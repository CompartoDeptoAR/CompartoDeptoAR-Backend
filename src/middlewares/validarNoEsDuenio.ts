import { Request, Response, NextFunction } from "express";
import { RequestConUsuarioId } from "./validarUsuarioRegistrado";
import { UsuarioRepositorio } from "../repository/UsuarioRepositorio";

export async function validarNoEsDuenio(
  req: RequestConUsuarioId,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const idCalificador = req.usuarioId;
    const { idCalificado } = req.body;

    if (!idCalificador || !idCalificado) {
      res.status(400).json({ error: "IDs invalidos" });
      return;
    }

    if (idCalificador === idCalificado) {
      res.status(403).json({ error: "No podes calificarte a vos mismo!" });
      return;
    }
    const usuarioCalificado = await UsuarioRepositorio.buscarPorId(idCalificado);
    if (!usuarioCalificado) {
      res.status(404).json({ error: "El usuario a calificar no existe" });
      return;
    }

    next();
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Error al validar" });
  }
}