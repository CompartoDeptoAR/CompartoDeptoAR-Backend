import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

export function validarCampos(req: Request, res: Response, next: NextFunction) {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({
      mensaje: "Completa todos los campos",
      errores: errores.array(),
    });
  }
  next();
}