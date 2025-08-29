import { db } from "../config/firebase";
import{FieldValue} from "firebase-admin/firestore";

export interface Mensaje {
  remitenteId: string;
  destinatarioId: string;
  texto: string;
  hora?: FirebaseFirestore.FieldValue;
}

const MENSAJES= db.collection("mensajes");

export async function  guardarMensaje(mensaje: Mensaje){
    const mnsaje= await MENSAJES.add({
    ...mensaje,
    timestamp: FieldValue.serverTimestamp(),
  });
  return { id: mnsaje.id, ...mensaje };
}
//esta es solamente para chequear en postman eh
export async function obtenerMensajes(usuarioId: string) {
   //console.log("UsuarioId recibido:", usuarioId);
  const mensajes = await MENSAJES
    .where("destinatarioId", "==", usuarioId)
    .orderBy("timestamp", "asc")
    .get();

  return mensajes.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}