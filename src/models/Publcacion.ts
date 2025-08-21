import {UsuarioConId,PreferenciasUsuario} from "./Usuario";
//Sera q va a haber una publicacion determinada si solo buscas roomie y
//otra si buscas roomie + alquiler? ya me olvide lo q hablamos, no me odies xD.
export interface Publicacion{
    id?: string | undefined;
    titulo: string;
    descripcion: string;
    precio: number;//Entiendo q esto deberia cambiar segun lo de arriba,no?
    ubicacion: string;//Por ahora...
    foto?: string[] | undefined;
    reglas?: string[] | undefined;//tamb x ahora...
    preferencias?: PreferenciasUsuario | undefined;
    usuarioId: UsuarioConId["id"];
    estado: "activa" | "pausada" | "eliminada";
    createdAt: string;
    updatedAt: string;
}