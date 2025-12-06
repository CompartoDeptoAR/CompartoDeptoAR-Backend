import { Request, Response } from "express";
import { PublicacionServicio } from "../services/PublicacionServicio";
import { RequestConUsuarioId } from "../middlewares/validarUsuarioRegistrado";;

const publicacionServicio = new PublicacionServicio();

export class PublicacionController {

static async crear(req: RequestConUsuarioId, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuarioId;
      if (!usuarioId) {
        res.status(401).json({ error: "Usuario no autenticado" });
        return;
      }
      const datos = {
        ...req.body,
        usuarioId,
      };
      const publicacionDto = await publicacionServicio.crear(datos);
      res.status(201).json({
        mensaje: "Publicación creada correctamente 👌",
      });
    } catch (err: any) {
      res.status(err.status || 500).json({
        error: err.message || "Error interno del servidor"
      });
    }
  }

static async misPublicaciones(req: Request, res: Response): Promise<void> {
  try {
    const usuarioId = req.headers['x-user-id'] as string;
  //console.log("Controller - x-user-id header:", `"${usuarioId}"`);
    if (!usuarioId) {
      res.status(401).json({ error: "Falta x-user-id en el header" });
      return;
    }

    // Limpio el usuarioId por si acaso
    const usuarioIdLimpio = usuarioId.trim();
    //console.log("Controller - usuarioId limpio:", `"${usuarioIdLimpio}"`);

    const misPublicaciones = await publicacionServicio.misPublicaciones(usuarioIdLimpio);
    //console.log("Controller - publicaciones a devolver:", misPublicaciones.length);
    res.status(200).json(misPublicaciones);

  } catch (err: any) {
    //console.error("Error en misPublicaciones:", err);
    res.status(err.status || 500).json({ error: err.message || "Error interno" });
  }
}

  static async traerTodas(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const startAfterId = req.query.startAfterId as string | undefined;

      const resultado = await publicacionServicio.traerPaginadas(limit, startAfterId);
      res.status(200).json(resultado);

    } catch (err: any) {
      res.status(err.status || 500).json({ error: err.message || "Error interno" });
    }
  }

  static async obtenerPorId(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const publicacion = await publicacionServicio .obtenerPorId(id!);
      if (!publicacion) {
        res.status(404).json({ error: `No se encontro la publicacion con ID: ${id}` });
        return;
      }
      const response = {
        ...publicacion,
        createdAt: publicacion.createdAt?.toDate().toISOString() || new Date().toISOString(),
        updatedAt: publicacion.updatedAt?.toDate().toISOString() || new Date().toISOString()
      };
      res.json(response);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async actualizar(req: RequestConUsuarioId, res: Response): Promise<void> {
    try {
      const idUsuario = req.usuarioId;
      const idPublicacion = String(req.params.idPublicacion);
      const datos = req.body;

      if (!idUsuario) {
        res.status(401).json({ error: "Usuario no loggeado" });
        return;
      }
      await publicacionServicio.actualizar(idUsuario, idPublicacion, datos);
      res.status(200).json({ mensaje: "Publicacion actualizada 👌" });
    } catch (err: any) {
      res.status(err.status || 500).json({ error: err.message || "Error interno" });
    }
  }

  static async cambiarEstado(req: RequestConUsuarioId, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      const usuarioId = req.usuarioId;

      if (!usuarioId) {
        res.status(401).json({ error: "Usuario no autenticado" });
        return;
      }

      if (!id || !estado) {
        res.status(400).json({ error: "Faltan datos requeridos: id de publicación y estado" });
        return;
      }

      const estadosValidos = ["activa", "pausada", "eliminada"];
      if (!estadosValidos.includes(estado)) {
        res.status(400).json({ error: "Estado no válido. Debe ser: activa, pausada o eliminada" });
        return;
      }

      const resultado = await publicacionServicio.cambiarEstado(id, usuarioId, estado);

      if (resultado.success) {
        res.status(200).json({
          mensaje: resultado.message,
          estado: estado
        });
      } else {
        res.status(403).json({ error: resultado.message });
      }
    } catch (err: any) {
      console.error("Error en cambiarEstado:", err);
      res.status(err.status || 500).json({
        error: err.message || "Error interno del servidor"
      });
    }
  }

  static async eliminar(req: RequestConUsuarioId, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const usuarioId = req.usuarioId!;

      await publicacionServicio.eliminar(id, usuarioId);
      res.status(200).json({ mensaje: "Publicacion eliminada 👌" });

    } catch (err: any) {
      res.status(err.status || 500).json({ error: err.message || "Error interno" });
    }
  }

  static async eliminarPorUsuario(req: RequestConUsuarioId, res: Response): Promise<void> {
  try {
    const usuarioId = req.usuarioId!;
    await publicacionServicio.eliminarPorUsuario(usuarioId);
    res.status(200).json({ mensaje: "Todas las publicaciones del usuario fueron eliminadas" });
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || "Error interno" });
  }
}


  static async buscar(req: Request, res: Response): Promise<void> {
    try {
      const texto = req.query.texto as string;

      if (!texto) {
        res.status(400).json({ mensaje: "Falta el texto para buscar" });
        return;
      }

      const publicaciones = await publicacionServicio.buscar(texto);
      res.json(publicaciones);

    } catch (error: any) {
      console.error("Error buscando publicaciones:", error);

      if (error.status && error.message) {
        res.status(error.status).json({ mensaje: error.message });
        return;
      }

      res.status(500).json({ mensaje: "Error interno en el servidor" });
    }
  }

  static async buscarConFiltros(req: Request, res: Response): Promise<void> {
    try {
      const filtros = req.body;
      const publicaciones = await publicacionServicio.buscarConFiltros(filtros);
      res.status(200).json(publicaciones);

    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message || "Error al buscar publicaciones" });
    }
  }
}