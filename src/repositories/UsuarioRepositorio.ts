//revisar, aun incompleto...
import { db } from "../config/firebase";
import { Usuario } from "../models/Usuario";

export class UsuarioRepositorio {
  private coleccion = db.collection("usuarios");

    async buscarPorCorreo(correo: string): Promise<Usuario | null> {
        const query = await this.coleccion.where("correo", "==", correo).get();
        if (query.empty) return null;
        const doc = query.docs[0];
        if (!doc) return null;
        return { id: doc.id, ...doc.data() } as Usuario;
    }

    async crear(usuario: Usuario): Promise<string> {
        const docRef = await this.coleccion.add(usuario);
        return docRef.id;
    }
}
