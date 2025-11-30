import { Request, Response } from "express";
import { ContactoServicio } from "../services/ContactoServicio";

export class ContactoController {

  static async crear(req: Request, res: Response): Promise<Response>{
    try {
      const { mail, mensaje } = req.body;
      const resultado = await ContactoServicio.crear({ mail, mensaje });

      return res.status(201).json({
        mensaje: "Mensaje enviado correctamente. Te contactaremos pronto 👍",
        id: resultado.id
      });

    } catch (error: any) {
      console.error("ERROR:", error);
      return res.status(500).json({
        error: error.message || "Error enviando contacto"
      });
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
