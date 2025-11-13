import { Calificacion } from "../models/Calificacion";
import { Timestamp } from "firebase-admin/firestore";

export interface CalificacionDto {
  id?: string;
  idCalificador: string;
  idCalificado: string | number;
  puntuacion: number;
  comentario: string;
  fecha: Date;
  nombreCalificador?: string;
}

export function pasarADto(calificacion: Calificacion): CalificacionDto {
  const dto: CalificacionDto = {
    idCalificador: calificacion.idCalificador,
    idCalificado: calificacion.idCalificado,
    puntuacion: calificacion.puntuacion,
    comentario: calificacion.comentario,
    fecha:
      calificacion.fecha instanceof Timestamp
        ? calificacion.fecha.toDate()
        : new Date(),
  };

  if (calificacion.id) dto.id = calificacion.id;
  if (calificacion.nombreCalificador) dto.nombreCalificador = calificacion.nombreCalificador;

  return dto;
}


export function pasarAModelo(dto: CalificacionDto): Calificacion {
  return {
    ...dto,
    fecha: dto.fecha instanceof Date
      ? Timestamp.fromDate(dto.fecha)
      : dto.fecha,
  };
}