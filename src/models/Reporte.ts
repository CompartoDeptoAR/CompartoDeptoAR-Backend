import { Timestamp } from "firebase-admin/firestore";

export interface Reporte {
  id?: string;
  tipo: "publicacion" | "mensaje";
  idContenido: string;
  motivo: string;
  descripcion:string;
  reportanteId?: string;
  fechaReporte: Timestamp;
  revisado?: boolean;
  accionTomada?: "dejado" | "eliminado" | null;
  adminId?: string | null;
  motivoEliminacion?: string | null;
}


export interface MiniReporte{
  descripcion: string;
  id: string;
  tipo: "publicacion" | "mensaje";
  motivo:string;
  fechaReporte: Timestamp;
  revisado?: boolean;
}

