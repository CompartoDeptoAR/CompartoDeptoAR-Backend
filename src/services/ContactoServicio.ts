import ContactoRepositorio from "../repository/ContactoRepositorio";
import { ContactoDto, pasarAModelo, pasarADto } from "../dtos/ContactoDto";
import { enviarCorreoContacto } from "../helpers/Correo"

export class ContactoServicio {

  static async crear(dto: ContactoDto): Promise<{ mensaje: string; id: string }> {
    try {
      console.log("➡️ SERVICIO: Iniciando la transformación del DTO.");
      const modelo = pasarAModelo(dto);

      console.log("➡️ SERVICIO: Intentando guardar en ContactoRepositorio.");
      const id = await ContactoRepositorio.crear({
        mail: modelo.mail,
        mensaje: modelo.mensaje,
        creadoEn: modelo.creadoEn,
      });

      console.log(`✅ SERVICIO: Mensaje guardado en DB con ID: ${id}.`);
      console.log("➡️ SERVICIO: Intentando enviar correo de contacto.");

      await enviarCorreoContacto(modelo.mail, modelo.mensaje);

      console.log("✅ SERVICIO: Correo enviado con éxito.");

      return { mensaje: "Mensaje enviado correctamente 👍", id };
    } catch (error) {
      console.error("❌ SERVICIO: Error capturado en ContactoServicio.crear:", error);
      throw error;
    }
  }

  static async listar(): Promise<ContactoDto[]> {
    const modelos = await ContactoRepositorio.listar();
    return modelos.map(m => pasarADto(m));
  }
}
