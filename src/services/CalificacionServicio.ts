import { CalificacionRepositorio } from "../repository/CalificacionRepositorio";
import { UsuarioRepositorio } from "../repository/UsuarioRepositorio";
import { Calificacion } from "../models/Calificacion";
import { Timestamp } from "firebase-admin/firestore";
import { CalificacionDto, pasarADto } from "../dtos/calificacionDto";
import { enviarCorreoCalificacionRecibida } from "../helpers/Correo";

export class CalificacionServicio {

  static async crearCalificacion(
    idCalificador: string,
    idCalificado: string,
    puntuacion: number,
    comentario: string,
    nombreCalificador?: string
  ): Promise<{ mensaje: string; promedio: number }> {

    if (idCalificador === idCalificado) {
      throw { status: 403, message: "No puedes calificarte a vos mismo!" };
    }

    if (!puntuacion || puntuacion < 1 || puntuacion > 5) {
      throw { status: 400, message: "La puntuacion tiene que ser entre 1 y 5." };
    }

    const nuevaCalificacion: Calificacion = {
      idCalificador,
      idCalificado,
      puntuacion,
      comentario,
      fecha: Timestamp.now(),
      nombreCalificador,
    };

    await CalificacionRepositorio.crearOActualizar(nuevaCalificacion);

    const usuarioCalificado = await UsuarioRepositorio.buscarPorId(idCalificado);
    if (usuarioCalificado?.correo) {
      await enviarCorreoCalificacionRecibida(
        usuarioCalificado.correo,
        nombreCalificador || "Otro usuario",
        puntuacion,
        comentario
      );
    }

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

  static async obtenerSoloPromedio(idUsuario: string): Promise<{ promedio: number; cantidad: number }> {
    const calificaciones = await CalificacionRepositorio.obtenerPorUsuario(idUsuario);
    const cantidad = calificaciones.length;
    const promedio = cantidad
      ? calificaciones.reduce((acc, c) => acc + c.puntuacion, 0) / cantidad
      : 0;

    return { promedio, cantidad };
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