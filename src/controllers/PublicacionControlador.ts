import { Request, Response } from "express";
import { PublicacionServicio } from "../services/PublicacionServicio";
import { RequestConUsuarioId } from "../middlewares/validarUsuarioRegistrado";
import { esAdmin } from "../helpers/AdminValidacion";
import { AppError } from "../error/AppError";

const publicacionServicio = new PublicacionServicio();

export class PublicacionController {

  static async crear(req: RequestConUsuarioId, res: Response): Promise<void> {
    const usuarioId = req.usuarioId;
    if (!usuarioId) {
      throw new AppError("Usuario no autenticado", 401);
    }
    const datos = { ...req.body, usuarioId };
    await publicacionServicio.crear(datos);
    res.status(201).json({ mensaje: "Publicacion creada correctamente 👌" });
  }

  static async misPublicaciones(req: RequestConUsuarioId, res: Response): Promise<void> {
    const usuarioId = req.usuarioId;
    if (!usuarioId) {
      throw new AppError("Usuario no autenticado", 401);
    }
    const usuarioIdLimpio = usuarioId.trim();
    const misPublicaciones = await publicacionServicio.misPublicaciones(usuarioIdLimpio);
    res.status(200).json(misPublicaciones);
  }

  static async traerTodas(req: Request, res: Response): Promise<void> {
    const limit = parseInt(req.query.limit as string) || 10;
    const startAfterId = req.query.startAfterId as string | undefined;
    const resultado = await publicacionServicio.traerPaginadas(limit, startAfterId);
    res.status(200).json(resultado);
  }

  static async traerTodasAdmin(req: Request, res: Response): Promise<void> {
    const resultado = await publicacionServicio.traerTodasAdmin();
    res.status(200).json(resultado);
  }

 static async obtenerPorId(req: RequestConUsuarioId, res: Response): Promise<void> {
    const { id } = req.params;
    const usuarioId = req.usuarioId;
    const publicacion = await publicacionServicio.obtenerPorId(id!);

    if (!publicacion) {
      throw new AppError(`No se encontro la publicacion con ID: ${id}`, 404);
    }

    // Si el estado de la pub es eliminada check si el user es admin
    if (publicacion.estado === "eliminada") {
      if (!usuarioId) {
        throw new AppError("Esta publicacion ya no esta disponible", 410);
      }
      const esAdministrador = await esAdmin(usuarioId);
      if (!esAdministrador) {
        throw new AppError("Esta publicacion ya no esta disponible", 410);
      }
    }

    // Si esta pausada, solo el admin o el q hizo la pueden verla
    if (publicacion.estado === "pausada") {
      const esAdministrador = await esAdmin(usuarioId!);
      const esPropietario = publicacion.usuarioId === usuarioId;

      if (!esAdministrador && !esPropietario) {
        throw new AppError("Esta publicacion no esta disponible", 410);
      }
    }

    const response = {
      ...publicacion,
      createdAt: publicacion.createdAt?.toDate().toISOString() || new Date().toISOString(),
      updatedAt: publicacion.updatedAt?.toDate().toISOString() || new Date().toISOString(),
      estaEliminada: publicacion.estado === "eliminada"
    };

    res.json(response);
  }

  static async obtenerPorIdAdmin(req: RequestConUsuarioId, res: Response): Promise<void> {
    const { id } = req.params;
    const usuarioId = req.usuarioId;
    if (!usuarioId) {
      throw new AppError("Usuario no autenticado", 401);
    }
    const esAdministrador = await esAdmin(usuarioId);
    if (!esAdministrador) {
      throw new AppError("Solo administradores pueden acceder a esta función", 403);
    }
    const publicacion = await publicacionServicio.obtenerPorIdAdmin(id!);
    if (!publicacion) {
      throw new AppError(`No se encontró la publicación con ID: ${id}`, 404);
    }

    const response = {
      ...publicacion,
      createdAt: publicacion.createdAt?.toDate().toISOString() || new Date().toISOString(),
      updatedAt: publicacion.updatedAt?.toDate().toISOString() || new Date().toISOString(),
      estaEliminada: publicacion.estado === "eliminada"
    };

    res.json(response);
}

  static async actualizar(req: RequestConUsuarioId, res: Response): Promise<void> {
    const idUsuario = req.usuarioId;
    const idPublicacion = String(req.params.idPublicacion);
    const datos = req.body;

    if (!idUsuario) {
      throw new AppError("Usuario no loggeado", 401);
    }

    await publicacionServicio.actualizar(idUsuario, idPublicacion, datos);
    res.status(200).json({ mensaje: "Publicacion actualizada 👌" });
  }

  static async cambiarEstado(req: RequestConUsuarioId, res: Response): Promise<void> {
    const { id } = req.params;
    const { estado } = req.body;
    const usuarioId = req.usuarioId;

    if (!usuarioId) {
      throw new AppError("Usuario no autenticado", 401);
    }

    if (!id || !estado) {
      throw new AppError("Faltan datos requeridos: id de publicación y estado", 400);
    }

    const estadosValidos = ["activa", "pausada", "eliminada"];
    if (!estadosValidos.includes(estado)) {
      throw new AppError("Estado no válido. Debe ser: activa, pausada o eliminada", 400);
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
  }

  static async eliminar(req: RequestConUsuarioId, res: Response): Promise<void> {
    const id = String(req.params.id);
    const usuarioId = req.usuarioId;

    if (!usuarioId) {
      throw new AppError("Usuario no autenticado", 401);
    }

    await publicacionServicio.eliminar(id, usuarioId);
    res.status(200).json({ mensaje: "Publicacion eliminada 👌" });
  }

  static async eliminarPorUsuario(req: RequestConUsuarioId, res: Response): Promise<void> {
    const usuarioId = req.usuarioId;

    if (!usuarioId) {
      throw new AppError("Usuario no autenticado", 401);
    }

    await publicacionServicio.eliminarPorUsuario(usuarioId);
    res.status(200).json({ mensaje: "Todas las publicaciones del usuario fueron eliminadas" });
  }

  static async eliminarSoft(req: RequestConUsuarioId, res: Response): Promise<void> {
    const id = String(req.params.id);
    const usuarioId = req.usuarioId;

    if (!usuarioId) {
      throw new AppError("Usuario no autenticado", 401);
    }

    await publicacionServicio.eliminarSoft(id, usuarioId);
    res.status(200).json({ mensaje: "Publicacion eliminada 👌" });
  }

  static async restaurar(req: RequestConUsuarioId, res: Response): Promise<void> {
    const id = String(req.params.id);
    const usuarioId = req.usuarioId;

    if (!usuarioId) {
      throw new AppError("Usuario no autenticado", 401);
    }

    await publicacionServicio.restaurar(id, usuarioId);
    res.status(200).json({ mensaje: "Publicacion restaurada correctamente 👌" });
  }

  static async obtenerEliminadas(req: RequestConUsuarioId, res: Response): Promise<void> {
    const usuarioId = req.usuarioId;

    if (!usuarioId) {
      throw new AppError("Usuario no autenticado", 401);
    }

    const publicacionesEliminadas = await publicacionServicio.obtenerEliminadas(usuarioId);
    res.status(200).json(publicacionesEliminadas);
  }

  static async buscar(req: Request, res: Response): Promise<void> {
    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      throw new AppError("Falta el texto para buscar", 400);
    }

    const texto = q.trim();
    const publicaciones = await publicacionServicio.buscar(texto);
    res.json(publicaciones);
  }

  static async buscarConFiltros(req: Request, res: Response): Promise<void> {
    const filtros = req.body;
    const publicaciones = await publicacionServicio.buscarConFiltros(filtros);
    res.status(200).json(publicaciones);
  }
}
