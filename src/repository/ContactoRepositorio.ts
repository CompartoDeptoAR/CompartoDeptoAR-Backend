import { db } from "../config/firebase";
import { pasarAModelo } from "../dtos/ContactoDto";
import { Contacto } from "../models/Contacto";

export class ContactoRepositorio {
  private coleccion = db.collection("contactos");

  async crear(contacto: Omit<Contacto, "id">): Promise<string> {
    const doc = await this.coleccion.add(contacto);
    return doc.id;
  }

  async listar(): Promise<Contacto[]> {
    const snapshot = await this.coleccion.orderBy("creadoEn", "desc").get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return pasarAModelo({
        id: doc.id,
        ...(data as any)
      });
    })
  }
}

export default new ContactoRepositorio();
