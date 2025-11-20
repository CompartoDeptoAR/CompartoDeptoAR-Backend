import { HabitosUsuario, PreferenciasUsuario } from "../models/Usuario";

export interface ActualizarUsuarioDto {
  nombreCompleto?: string;
  edad?: number;
  genero?: string;
  descripcion?: string;
  preferencias?: PreferenciasUsuario;
  habitos?: HabitosUsuario;
}