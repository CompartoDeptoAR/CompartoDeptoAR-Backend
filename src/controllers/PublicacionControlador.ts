//Tiempo al tiempo (?
import { Request, Response } from "express";
import { PublicacionServicio } from "../services/PublicacionServicio";

const publicacionServicio = new PublicacionServicio();

export class PublicacionController {

  static async crear(req: Request, res: Response) {
    console.log("REQ.BODY:", req.body);
    try {
      const publicacionDto = await publicacionServicio.crear(req.body);
      return res.status(201).json({
        mensaje: "Publicación creada 👌",
        publicacion: publicacionDto,
      });
    } catch (err: any) {
      return res.status(err.status || 500).json({ error: err.message || "Error interno" });
    }
  }

  static async traerTodas(req: Request, res: Response) {
    try {
      const publicaciones = await publicacionServicio.traerTodas();
      return res.status(200).json(publicaciones);
    } catch (err: any) {
      return res.status(err.status || 500).json({ error: err.message || "Error interno" });
    }
  }

  static async actualizar(req: Request, res: Response) {
    throw Error("Method no implement")
  }

  static async eliminar(req: Request, res: Response) {
    throw Error("Method no implement")
  }
}
