import { Reporte } from "../models/Reporte";
import { Timestamp } from "firebase-admin/firestore";

export interface ReporteDto {
  id?: string;
  tipo: "publicacion" | "mensaje";
  idContenido: string;
  motivo: string;
  reportanteId?: string;
  fechaReporte: Date;
  revisado?: boolean;
  accionTomada?: "dejado" | "eliminado" | null;
  adminId?: string | null;
  motivoEliminacion?: string | null;
}

export function pasarADto(reporte: Reporte): ReporteDto {
  const dto: ReporteDto = {
    tipo: reporte.tipo,
    idContenido: reporte.idContenido,
    motivo: reporte.motivo,
    fechaReporte: reporte.fechaReporte instanceof Timestamp ? reporte.fechaReporte.toDate() : new Date(),
  };
  if (reporte.id) dto.id = reporte.id;
  if (reporte.reportanteId) dto.reportanteId = reporte.reportanteId;
  if (typeof reporte.revisado !== "undefined") dto.revisado = reporte.revisado;
  if (reporte.accionTomada) dto.accionTomada = reporte.accionTomada;
  if (reporte.adminId) dto.adminId = reporte.adminId;
  if (reporte.motivoEliminacion) dto.motivoEliminacion = reporte.motivoEliminacion;
  return dto;
}

export function pasarAModelo(dto: ReporteDto): Reporte {
  return {
    ...dto,
    fechaReporte: dto.fechaReporte instanceof Date ? Timestamp.fromDate(dto.fechaReporte) : Timestamp.now()
  } as Reporte;
}
