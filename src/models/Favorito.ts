import { FieldValue, Timestamp } from "firebase-admin/firestore";

export interface Favorito {
  id?: string;
  usuarioId: string;
  publicacionId: string;
  fechaGuardado: Timestamp | FieldValue;
}
