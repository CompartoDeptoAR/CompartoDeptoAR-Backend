export interface PreferenciasUsuario {
  fumador?: boolean;
  mascotas?: boolean;
  horarios?: string;
  orden?: string;
}

export interface UsuarioPerfil {
  nombreCompleto: string;
  edad: number;
  genero?: string;
  descripcion?: string;
  preferencias?: PreferenciasUsuario;
}

export interface Usuario {
  id?: string;
  correo: string;
  contraseña: string;
  rol: string;
  fechaCreacion: Date;
  perfil: UsuarioPerfil;
}


export interface UsuarioConId extends Usuario {
  id: string;
}
