export interface LoginDto {
  correo: string;
  contrasena: string;
}

export interface LoginResponseDto {
  ID: string;
  rol: string[];
  mail: string;
  token: string;
}