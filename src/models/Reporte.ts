import { Timestamp } from "firebase-admin/firestore";

export interface Reporte {
  id?: string;
  tipo: "publicacion" | "mensaje";
  idContenido: string;
  motivo: string;
  reportanteId?: string;
  fechaReporte: Timestamp;
  revisado?: boolean;
  accionTomada?: "dejado" | "eliminado" | null;
  adminId?: string | null;
  motivoEliminacion?: string | null;
}