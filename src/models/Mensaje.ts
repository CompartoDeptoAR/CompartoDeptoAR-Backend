import { Timestamp } from "firebase-admin/firestore";

export interface Mensaje {
  id?: string;
  idRemitente: string;
  idDestinatario: string;
  idPublicacion: string;
  contenido: string;
  fechaHora: Timestamp;
  leido: boolean;
  participantes: string[];
}