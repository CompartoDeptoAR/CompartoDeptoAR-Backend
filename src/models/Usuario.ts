import { Timestamp } from "firebase-admin/firestore";
import { TipoRol } from "./tipoRol";

export interface PreferenciasUsuario {
  fumador?: boolean;
  mascotas?: boolean;
  musicaFuerte?: boolean;
  horariosNocturno?: boolean;
  visitas?: boolean;
  orden?: boolean;
  tranquilo?:boolean;
  social?:boolean;
}

export interface HabitosUsuario {
  fumador?: boolean;
  mascotas?: boolean;
  musicaFuerte?: boolean;
  horariosNocturno?: boolean;
  visitas?: boolean;
  orden?: boolean;
  tranquilo?:boolean;
  social?:boolean;
  cocino?: boolean;
  ejercicio?: boolean;
}

export interface UsuarioPerfil {
  nombreCompleto: string;
  edad: number;
  genero?: string | undefined;
  descripcion?: string | undefined;
  habitos?: HabitosUsuario | undefined;
  preferencias?: PreferenciasUsuario | undefined;
}

export interface UsuarioRol{
  id: string;
  rolId: TipoRol;
}

export interface Usuario {
  id: string;
  correo: string;
  contraseña: string;
  rol: UsuarioRol[];
  fechaCreacion?: Timestamp | undefined;
  perfil: UsuarioPerfil;
  promedioCalificaciones?: number;
  cantidadCalificaciones?: number;
}


export interface UsuarioConId extends Usuario {
  firebaseUid: any;
  id: string;
}
