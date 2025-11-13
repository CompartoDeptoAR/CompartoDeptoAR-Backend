import { Mensaje } from "../models/Mensaje";
import { Timestamp } from "firebase-admin/firestore";

export interface MensajeDto {
  id?: string;
  idRemitente: string;
  idDestinatario: string;
  idPublicacion: string;
  contenido: string;
  fechaHora: Date;
  leido: boolean;
  participantes: string[];
}

export function pasarADto(mensaje: Mensaje): MensajeDto {
  return {
    ...mensaje,
    fechaHora: mensaje.fechaHora instanceof Timestamp
      ? mensaje.fechaHora.toDate()
      : new Date(mensaje.fechaHora),
  };
}

export function pasarAModelo(dto: MensajeDto): Mensaje {
  return {
    ...dto,
    fechaHora: Timestamp.fromDate(dto.fechaHora),
  };
}