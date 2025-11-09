import { CalificacionRepositorio } from "../repositories/CalificacionRepositorio";
import { UsuarioRepositorio } from "../repositories/UsuarioRepositorio";
import { Calificacion } from "../models/Calificacion";

export class CalificacionServicio {

  static async crearCalificacion(
    idCalificador: string,
    idCalificado: string,
    puntuacion: number,
    comentario: string,
    nombreCalificador?: string
  ): Promise<string> {
//Debug porq esta mierda no funca
    console.log("Datos recibidos en CalificacionServicio.crearCalificacion:");
    console.log({ idCalificador, idCalificado, puntuacion, comentario, nombreCalificador });

    if (!puntuacion || puntuacion < 1 || puntuacion > 5) {
      throw { status: 400, message: "La puntuacion tiene que ser entre 1 y 5." };
    }
    if (!comentario || comentario.trim().length < 20) {
      throw { status: 400, message: "El comentario tiene que tener min 20 caracteres." };
    }

    const existe = await CalificacionRepositorio.existeCalificacion(idCalificador, idCalificado);
    if (existe) throw { status: 400, message: "Ya dejaste una calificacion para este usuario manija." };

    const huboInteraccion = await UsuarioRepositorio.huboInteraccion(idCalificador, idCalificado);
    if (!huboInteraccion) throw { status: 403, message: "Solamente podes calificar usuarios con los que hayas interactuado." };

    const nuevaCalificacion: Calificacion = {
      idCalificador,
      idCalificado,
      puntuacion,
      comentario,
      fecha: new Date(),
      nombreCalificador,
    };

    await CalificacionRepositorio.crear(nuevaCalificacion);

    await this.actualizarPromedioUsuario(idCalificado);

    return "Calificacion guardada correctamente 👌";
  }

  static async obtenerCalificaciones(idUsuario: string): Promise<{ promedio: number; calificaciones: Calificacion[] }> {
    const calificaciones = await CalificacionRepositorio.obtenerPorUsuario(idUsuario);
    const promedio = calificaciones.length
      ? calificaciones.reduce((acc, c) => acc + c.puntuacion, 0) / calificaciones.length
      : 0;

    return { promedio, calificaciones };
  }

  private static async actualizarPromedioUsuario(idUsuario: string): Promise<void> {
    const { promedio } = await this.obtenerCalificaciones(idUsuario);
    await UsuarioRepositorio.actualizarPromedio(idUsuario, promedio);
  }
}
