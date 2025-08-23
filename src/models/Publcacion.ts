import {UsuarioConId,PreferenciasUsuario, HabitosUsuario} from "./Usuario";
import { Timestamp } from "firebase-admin/firestore";
//Sera q va a haber una publicacion determinada si solo buscas roomie y
//otra si buscas roomie + alquiler? ya me olvide lo q hablamos, no me odies xD.
export interface Publicacion{
    id?: string | undefined;
    titulo: string;
    descripcion: string;
    precio: number;//Entiendo q esto deberia cambiar segun lo de arriba,no?
    ubicacion: string;//Por ahora...
    foto?: string[] | undefined;
    reglas?: string[] | undefined;//tamb x ahora...
    preferencias?: PreferenciasUsuario | undefined;
    habitos?: HabitosUsuario | undefined;
    usuarioId: UsuarioConId["id"];
    estado: "activa" | "pausada" | "eliminada";
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

//Aca irian + desp...
export interface FiltrosBusqueda {
  ubicacion?: string;
  precioMin?: number;
  precioMax?: number;
  noFumadores?: boolean;
  sinMascotas?: boolean;
  tranquilo?: boolean;
  social?: boolean;
}