import { Timestamp } from "firebase-admin/firestore";
import { Contacto } from "../models/Contacto";

export interface ContactoDto {
  id?: string;
  mail: string;
  mensaje: string;
  creadoEn?: Timestamp;
}

export function pasarAModelo(dto: ContactoDto): Contacto {
  return {
    id: dto.id || "",
    mail: dto.mail,
    mensaje: dto.mensaje,
    creadoEn: dto.creadoEn instanceof Timestamp
      ? dto.creadoEn.toDate()
      : new Date(),
  };
}

export function pasarADto(modelo: Contacto): ContactoDto {
  return {
    id: modelo.id,
    mail: modelo.mail,
    mensaje: modelo.mensaje,
    creadoEn: Timestamp.fromDate(modelo.creadoEn),
  };
}