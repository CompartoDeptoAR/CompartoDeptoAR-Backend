export interface BuscarPublicacionesDto {
  texto?: string;
  ubicacion?: string;
  precioMin?: number;
  precioMax?: number;
  noFumadores?: boolean;
  sinMascotas?: boolean;
  tranquilo?: boolean;
  social?: boolean;
  limit?: number;
  page?: number;
}