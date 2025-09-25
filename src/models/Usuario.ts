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
  genero?: string | undefined;
  descripcion?: string | undefined;
  habitos?: HabitosUsuario | undefined;
  preferencias?: PreferenciasUsuario | undefined;
}

export interface UsuarioRol{
  id: string;
  //usuarioId: string;
  rolId: string;
}

export interface Usuario {
  id: string;
  correo: string;
  contraseña: string;
  rol: UsuarioRol[];
  fechaCreacion?: Date | undefined;
  perfil: UsuarioPerfil;
}


export interface UsuarioConId extends Usuario {
  id: string;
}
