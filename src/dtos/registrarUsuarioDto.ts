import { PreferenciasUsuario, HabitosUsuario, UsuarioPerfil } from "../models/Usuario";

export interface RegistrarUsuarioDto {
  correo: string;
  contraseña: string;
  firebaseUid?: string;

  perfil: {
    nombreCompleto: string;
    edad: number;
    genero?: string;
    descripcion?: string;
    preferencias?: PreferenciasUsuario;
    habitos?: HabitosUsuario;
  };
}

