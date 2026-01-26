import { Request, Response } from "express";
import { ContactoServicio } from "../services/ContactoServicio";
import { AppError } from "../error/AppError";

export class ContactoController {

  static async crear(req: Request, res: Response): Promise<void> {
    const { mail, mensaje } = req.body;

    if (!mail || !mensaje) {
      throw new AppError("Mail y mensaje son obligatorios", 400);
    }

    const resultado = await ContactoServicio.crear({ mail, mensaje });

    res.status(201).json({
      mensaje: "Mensaje enviado correctamente. Te contactaremos pronto 👍",
      id: resultado.id
    });
  }

  static async listar(req: Request, res: Response): Promise<void> {
    const contactos = await ContactoServicio.listar();
    res.status(200).json(contactos);
  }
}