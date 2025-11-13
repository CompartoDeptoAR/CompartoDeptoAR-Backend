import { Favorito } from "../models/Favorito";
import { Timestamp } from "firebase-admin/firestore";

export interface FavoritoDto {
  id?: string;
  usuarioId: string;
  publicacionId: string;
  fechaGuardado: Date;
}

export function pasarADto(favorito: Favorito): FavoritoDto {
  return {
    ...favorito,
    fechaGuardado: favorito.fechaGuardado instanceof Timestamp
      ? favorito.fechaGuardado.toDate()
      : new Date(),
  };
}

export function pasarAModelo(dto: FavoritoDto): Favorito {
  return {
    ...dto,
    fechaGuardado: Timestamp.fromDate(dto.fechaGuardado),
  };
}
