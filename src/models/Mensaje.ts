export interface Mensaje {
  id?: string;
  idRemitente: string;
  idDestinatario: string;
  idPublicacion: string;
  contenido: string;
  fechaHora: Date;
  leido: boolean;
  participantes: string[];
}