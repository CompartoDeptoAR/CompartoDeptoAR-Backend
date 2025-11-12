import { Timestamp } from "firebase-admin/firestore";

export interface Calificacion {
  id?: string | undefined;
  idCalificador: string;
  idCalificado: string | number;
  puntuacion: number;
  comentario: string;
  fecha:Timestamp;
  nombreCalificador?: string | undefined;
}