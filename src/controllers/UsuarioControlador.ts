//Esta es la primmer capa desde el back al front,entonces los DTOs deberian formarce aca,
//osea el controlador, es un patova.
import { Request, Response } from "express";
import { RequestConUsuarioId } from "../middlewares/validarUsuarioRegistrado";
import { RegistrarUsuarioDto} from "../dtos/registrarUsuarioDto"
import { UsuarioServicio } from "../services/UsuarioServicio";

const usuarioServicio = new UsuarioServicio();

export class UsuarioController {

static async registrar(req: Request, res: Response): Promise<any> {
  try {
    const dto: RegistrarUsuarioDto = {
      correo: req.body.correo,
      contraseña: req.body.contraseña,
      nombreCompleto: req.body.nombreCompleto,
      edad: req.body.edad,
      genero: req.body.genero,
      descripcion: req.body.descripcion,
      preferencias: req.body.preferencias,
      habitos: req.body.habitos,
    };

    const usuarioCreado = await usuarioServicio.registrar(dto);

    res.status(201).json({
      mensaje: "Usuario registrado 😎",
      usuario: usuarioCreado,//Me tengo q acordar de borrarlo, es por ahora q necesito los datos
    });
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || "Error interno" });
  }
}

  static async traerPerfil(req: RequestConUsuarioId, res: Response):Promise<Response>{
    try {
      const usuarioId = req.usuarioId;
      if (!usuarioId) return res.status(401).json({ error: "Token invalido" });

      const perfil = await usuarioServicio.traerPerfil(usuarioId);
      return res.json(perfil);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Error interno" });
    }
  }

  static async actualizarPerfil(req: RequestConUsuarioId, res: Response):Promise<Response> {
    try {
      const usuarioId = req.usuarioId;
      const datosActualizados = req.body;

      if (!usuarioId) {
        return res.status(401).json({ error: "Token invalido" });
      }
      await usuarioServicio.actualizarPerfil(usuarioId, datosActualizados);
      return res.status(200).json({ mensaje: "Perfil actualizado 😎" });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
//Esto nomas es para los admin
 static async asignarRol(req: RequestConUsuarioId, res: Response):Promise<Response> {
    try {
      const { usuarioId, rol } = req.body;

      if (!usuarioId || !rol) {
        return res.status(400).json({ error: "usuarioId y rol son requeridos" });
      }
      await usuarioServicio.asignarRol(usuarioId, rol);
      return res.json({ mensaje: `El rol ${rol}  fue asignado al usuario 👍 al usuario ${usuarioId}` });
    } catch (err: any) {
     return res.status(500).json({ error: err.message });
    }
  }

  static async sacarRol(req: RequestConUsuarioId, res: Response) :Promise<Response>{
    try {
      const { usuarioId, rol } = req.body;

      if (!usuarioId || !rol) {
        return res.status(400).json({ error: "usuarioId y rolId son " });
      }
      await usuarioServicio.sacarRol(usuarioId, rol);
        return res.json({ mensaje: `Rol ${rol} quitado del usuario ${usuarioId}` });
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
  }

}