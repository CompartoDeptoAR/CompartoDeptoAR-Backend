import { TipoRol } from "./tipoRol";

//Desp add +
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
  conino?: boolean;
  ejercicio?: boolean;
}

export interface UsuarioPerfil {
  nombreCompleto: string;
  edad: number;
  genero?: string;
  descripcion?: string;
  habitos?: HabitosUsuario;
  preferencias?: PreferenciasUsuario;
}

export interface Rol {
  id: string;
  rol: TipoRol;
}

export interface UsuarioRol{
  id: string;
  usuarioId: UsuarioConId; //poner solo string?
  rolId: Rol["id"]        //poner solo string?
}

export interface Usuario {
  id: string;
  correo: string;
  contraseña: string;
  rol: UsuarioRol; // string[] ?
  fechaCreacion?: Date | undefined;
  perfil: UsuarioPerfil;
}


export interface UsuarioConId extends Usuario {
  id: string;
}
