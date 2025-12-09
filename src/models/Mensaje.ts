import { Timestamp } from "firebase-admin/firestore";

export interface Mensaje {
  id?: string;
  idRemitente: string;
  idDestinatario: string;
  idPublicacion: string;
  contenido: string;
  fechaEnvio: Timestamp;
  leido: boolean;
  participantes: string[];
}