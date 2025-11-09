export interface Calificacion {
  id?: string | undefined;
  idCalificador: string;
  idCalificado: string | number;
  puntuacion: number;
  comentario: string;
  fecha: Date; //deveria poner la de firebase luego
  nombreCalificador?: string | undefined;   // o seria anonimo?
}