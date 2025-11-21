import { Request, Response } from "express";
import { ContactoServicio } from "../services/ContactoServicio";

export class ContactoController {

 /* static async crear(req: Request, res: Response): Promise<Response> {
    try {
      const { mail, mensaje } = req.body;

      if (!mail || !mensaje) {
        return res.status(400).json({ error: "Mail y mensaje son obligatorios" });
      }
      const resultado = await ContactoServicio.crear({ mail, mensaje });
      return res.status(201).json(resultado);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Error enviando contacto" });
    }
  }*/
   static async crear(req: Request, res: Response): Promise<Response>{
    console.log("✅ Petición POST /api/contacto recibida. Datos:", req.body);
    const { mail, mensaje } = req.body;

    if (!mail || !mensaje) {
        return res.status(400).json({ error: "Mail y mensaje son obligatorios" });
    }

    try {
      // ----------------------------------------------------------------------
      // ⚠️ ZONA CRÍTICA: Llama a tu servicio original.
      // ----------------------------------------------------------------------
      const resultado = await ContactoServicio.crear({ mail, mensaje });

      console.log("✅ Lógica de contacto ejecutada con éxito. Respondiendo 201.");
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
