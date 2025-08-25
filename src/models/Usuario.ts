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

export interface Usuario {
  id?: string | undefined;
  correo: string;
  contraseña: string;
  rol: string;
  fechaCreacion?: Date;
  perfil: UsuarioPerfil;
}


export interface UsuarioConId extends Usuario {
  id: string;
}
