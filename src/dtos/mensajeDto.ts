import { Mensaje } from "../models/Mensaje";
import { Timestamp } from "firebase-admin/firestore";

export interface MensajeDto {
  id?: string;
  idRemitente: string;
  idDestinatario: string;
  idPublicacion: string;
  contenido: string;
  fechaEnvio: Date;
  leido: boolean;
  participantes: string[];
}

export function pasarADto(mensaje: Mensaje): MensajeDto {
  return {
    ...mensaje,
    fechaEnvio: mensaje.fechaEnvio instanceof Timestamp
      ? mensaje.fechaEnvio.toDate()
      : new Date(mensaje.fechaEnvio),
  };
}

export function pasarAModelo(dto: MensajeDto): Mensaje {
  return {
    ...dto,
    fechaEnvio: Timestamp.fromDate(dto.fechaEnvio),
  };
}