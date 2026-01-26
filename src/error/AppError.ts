import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  statusCode: number;

  constructor(mensaje: string, statusCode = 500) {
    super(mensaje);
    this.statusCode = statusCode;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
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