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
      validateSMTP: true
    });

    if (resultado.valid) {
      return {
        valido: true,
        razon: "OK",
      };
    }

    return {
      valido: false,
      razon: resultado.reason || "Email invalido",
    };
  } catch (err) {
    console.error("Error validando email:", err);
    return { valido: false, razon: "Error interno al validar" };
  }
}
