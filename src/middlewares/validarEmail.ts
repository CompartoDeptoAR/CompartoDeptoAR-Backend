import { Request, Response, NextFunction } from "express";
import validate from "deep-email-validator";

export interface ResultadoEmail {
  valido: boolean;
  razon: string;
}

export async function validarEmail(email: string): Promise<ResultadoEmail> {
  try {
    const resultado = await validate({
      email,
      validateRegex: true,
      validateMx: true,
      validateTypo: true,
      validateDisposable: true,
      validateSMTP: false
    });

    /*console.log("🔍 Validación email resultado:" {
      email: email,
      valido: resultado.valid,
      razon: resultado.reason
    });*/

    if (resultado.valid) {
      return {
        valido: true,
        razon: "OK",
      };
    }

    return {
      valido: false,
      razon: resultado.reason || "Email inválido",
    };
  } catch (err) {
    //console.error(" Error validando email:", err);
    return { valido: false, razon: "Error interno al validar" };
  }
}

export const validarEmailMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const { correo } = req.body;

  if (!correo) {
    return res.status(400).json({
      ok: false,
      error: "El correo es obligatorio"
    });
  }

  const validacion = await validarEmail(correo);

  if (!validacion.valido) {
    return res.status(400).json({
      ok: false,
      mensaje: `Email invalido: ${validacion.razon}`
    });
  }

  next();
};