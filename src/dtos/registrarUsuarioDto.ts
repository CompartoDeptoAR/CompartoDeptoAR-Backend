import { PreferenciasUsuario, HabitosUsuario } from "../models/Usuario";

export interface RegistrarUsuarioDto {
  nombreCompleto: string;
  correo: string;
  contraseña: string;
  edad: number;
  genero?: string;
  descripcion?: string;
  preferencias?: PreferenciasUsuario;
  habitos?: HabitosUsuario;
}
