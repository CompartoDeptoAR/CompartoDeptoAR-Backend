//Todo a checkear con Eze, seguro se agregaran mas campos...
export interface PreferenciasUsuario {
  fumador?: boolean;
  mascotas?: boolean;
  horarios?: string;
  orden?: string;
}

export interface Usuario {
  id?: string | undefined;
  nombreCompleto: string;
  correo: string;
  contraseña: string;
  edad: number;
  genero?: string | undefined;
  descripcion?: string | undefined;
  preferencias?: PreferenciasUsuario | undefined;
  rol: string;
  fechaCreacion: Date;
}

export interface UsuarioConId extends Usuario{
  id: string;
}