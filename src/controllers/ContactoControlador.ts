import { Request, Response } from "express";
import { ContactoServicio } from "../services/ContactoServicio";
import { validarEmail } from "../middlewares/validarEmail";

export class ContactoController {

   static async crear(req: Request, res: Response): Promise<Response>{
    const { mail, mensaje } = req.body;
    const validacion = await validarEmail(mail);

    if (!validacion.valido) {
      return res.status(400).json({
        ok: false,
        mensaje: `Email invalido: ${validacion.razon}`
      });
    }
    if (!mail || !mensaje) {
        return res.status(400).json({ error: "Mail y mensaje son obligatorios" });
    }
    try {
      const resultado = await ContactoServicio.crear({ mail, mensaje });
      return res.status(201).json(resultado);
    } catch (error) {
      console.error("❌ ERROR al procesar el mensaje de contacto. El error ocurrió dentro del ContactoServicio:", error);
      return res.status(500).json({ error: onmessage || "Error enviando contacto" });
    }
   }

  static async listar(req: Request, res: Response): Promise<Response> {
    try {
      const contactos = await ContactoServicio.listar();
      return res.status(200).json(contactos);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Error listando contactos" });
    }
  }
}
