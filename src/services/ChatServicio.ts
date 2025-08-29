import { db } from "../config/firebase";
import { guardarMensaje,obtenerMensajes as repoObtenerMensajes, Mensaje } from "../repositories/ChatRepositorio";

export async function mandarMensaje(remitenteId: string, destinatarioId: string, texto: string){
    if (!remitenteId || !destinatarioId || !texto) {
        throw new Error("Faltan datos para mandar el mensaje");
    }
    const mensaje: Mensaje={remitenteId,destinatarioId,texto};
    return await guardarMensaje(mensaje);
}
//esta es solamente para chequear en postman eh
export async function obtenerMensajes(usuarioId: string) {
  return await repoObtenerMensajes(usuarioId);
}
