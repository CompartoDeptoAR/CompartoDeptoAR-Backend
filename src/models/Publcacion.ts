import {UsuarioConId,PreferenciasUsuario, HabitosUsuario} from "./Usuario";
import { Timestamp } from "firebase-admin/firestore";
//Sera q va a haber una publicacion determinada si solo buscas roomie y
//otra si buscas roomie + alquiler? ya me olvide lo q hablamos, no me odies xD.
export interface Publicacion{
    id?: string | undefined;
    usuarioFirebaseUid: string;
    titulo: string;
    descripcion: string;
    precio: number;
    ubicacion: string;
    foto?: string[] | undefined;
    reglas?: string[] | undefined;
    preferencias?: PreferenciasUsuario | undefined;
    habitos?: HabitosUsuario | undefined;
    usuarioId: UsuarioConId["id"];
    usuarioNombre?: string | undefined;
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

export interface PublicacionMini{
  id?: string | undefined;
  titulo: string;
  ubicacion: string;
  precio: number;
  foto?: string[] | undefined;
  estado: "activa" | "pausada" | "eliminada";
  usuarioId: UsuarioConId["id"];
}