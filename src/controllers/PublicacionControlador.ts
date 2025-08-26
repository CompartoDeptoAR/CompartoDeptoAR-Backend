//Tiempo al tiempo (?
import { Request, Response } from "express";
import { PublicacionServicio } from "../services/PublicacionServicio";
import { ServicioJWT } from "../services/ServicioJWT";
import { RequestConUsuarioId } from "../middlewares/validarUsuarioRegistrado";

const publicacionServicio = new PublicacionServicio();

export class PublicacionController {


  static async crear(req: Request, res: Response) {
    try {
      const tokenHeader = req.headers.authorization;
      if (!tokenHeader) return res.status(401).json({ error: "Tenes que iniciar sesion" });

      const token = tokenHeader.split(" ")[1];
      if (!token) return res.status(401).json({ error: "Token invalido" });

      const usuarioId = ServicioJWT.extraerIdUsuario(token);
      if (!token || !ServicioJWT.validarToken(token)) return res.status(401).json({ error: "Token invalido o expirado" });

      const datos = { ...req.body, usuarioId };
      const publicacionDto = await publicacionServicio.crear(datos);
      return res.status(201).json({
        mensaje: "Publicacion creada 👌",
        publicacion: publicacionDto,
      });

    } catch (err: any) {
      return res.status(err.status || 500).json({ error: err.message || "Error interno" });
    }
  }

  static async misPublicaciones(req: RequestConUsuarioId, res: Response){
    try{
      const usuarioiD = req.usuarioId;
      const misPublicaciones= await publicacionServicio.misPublicaciones(String(usuarioiD));
       return res.status(200).json(misPublicaciones);
    }catch (err: any) {
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

static async actualizar(req:RequestConUsuarioId , res: Response) {
    try {
      const idUsuario = req.usuarioId;
      const idPublicacion= req.params.idPublicacion;
      const datos= req.body;
      await publicacionServicio.actualizar(String(idUsuario), String(idPublicacion), datos);
      return res.status(200).json({ mensaje: "Publicacion actualizada 👌" });
    } catch (err: any) {
      return res.status(err.status || 500).json({ error: err.message || "Error interno" });
    }
  }

  static async eliminar(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      await publicacionServicio.eliminar(id);
      return res.status(200).json({ mensaje: "Publicacion eliminada 👌" });
    } catch (err: any) {
      return res.status(err.status || 500).json({ error: err.message || "Error interno" });
    }
  }

static async buscar(req: Request, res: Response) {
    try {
        const texto = req.query.texto as string;
        if (!texto) {
            return res.status(400).json({ mensaje: "Falta el texto para buscar" });
        }
        const publicaciones = await publicacionServicio.buscar(texto);
        return res.json(publicaciones);
    } catch (error: any) {
        console.error("Error buscando publicaciones:", error);
        if (error.status && error.message) {
            return res.status(error.status).json({ mensaje: error.message });
        }
        return res.status(500).json({ mensaje: "Error interno en el servidor" });
    }
}

}
