import { Request, Response, NextFunction } from "express";
import { AppError } from "../error/AppError";

export const errorMiddleware = (err: any,req: Request,res: Response,next: NextFunction) => {
  console.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      ok: false,
      mensaje: err.message,
    });
  }

  return res.status(500).json({
    ok: false,
    mensaje: "Error interno del servidor",
  });
};