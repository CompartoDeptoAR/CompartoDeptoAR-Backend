import { CalificacionRepositorio } from "../repository/CalificacionRepositorio";
import { UsuarioRepositorio } from "../repository/UsuarioRepositorio";
import { Calificacion } from "../models/Calificacion";
import { Timestamp } from "firebase-admin/firestore";
import { CalificacionDto, pasarADto } from "../dtos/calificacionDto";

export class CalificacionServicio {

  static async crearCalificacion(idCalificador: string,idCalificado: string,puntuacion: number, comentario: string, nombreCalificador?: string): Promise<{ mensaje: string; promedio: number }> {

    if (!puntuacion || puntuacion < 1 || puntuacion > 5) {
      throw { status: 400, message: "La puntuacion tiene que ser entre 1 y 5." };
    }
    //const huboInteraccion = await UsuarioRepositorio.huboInteraccion(idCalificador, idCalificado);
    //if (!huboInteraccion) throw { status: 403, message: "Solo podes calificar usuarios con los que hayas interactuado." };

    const nuevaCalificacion: Calificacion = {
      idCalificador,
      idCalificado,
      puntuacion,
      comentario,
      fecha: Timestamp.now(),
      nombreCalificador,
    };

    await CalificacionRepositorio.crearOActualizar(nuevaCalificacion);
    const { promedio, cantidad } = await this.actualizarPromedioUsuario(idCalificado);
    return {
      mensaje: "Calificacion guardada correctamente 👌",
      promedio
    };
  }

  static async obtenerCalificaciones(idUsuario: string): Promise<{ promedio: number; calificaciones: CalificacionDto[] }> {
    const calificaciones = await CalificacionRepositorio.obtenerPorUsuario(idUsuario);
    const promedio = calificaciones.length
      ? calificaciones.reduce((acc, c) => acc + c.puntuacion, 0) / calificaciones.length
      : 0;
    return {
      promedio,
      calificaciones: calificaciones.map(c => pasarADto(c))
    };
  }

  private static async actualizarPromedioUsuario(idUsuario: string): Promise<{ promedio: number; cantidad: number }> {
    const calificaciones = await CalificacionRepositorio.obtenerPorUsuario(idUsuario);
    const cantidad = calificaciones.length;
    const promedio = cantidad
      ? calificaciones.reduce((acc, c) => acc + c.puntuacion, 0) / cantidad
      : 0;

    await UsuarioRepositorio.actualizarPromedio(idUsuario, promedio, cantidad);

    return { promedio, cantidad };
  }
}
