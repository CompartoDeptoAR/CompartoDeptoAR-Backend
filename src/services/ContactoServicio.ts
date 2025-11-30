import ContactoRepositorio from "../repository/ContactoRepositorio";
import { ContactoDto, pasarAModelo, pasarADto } from "../dtos/ContactoDto";
import { enviarCorreoContacto } from "../helpers/Correo"

export class ContactoServicio {

  static async crear(dto: ContactoDto): Promise<{ mensaje: string; id: string }> {
    try {
      //console.log("SERVICIO: Iniciando proceso de contacto");
      if (!dto.mail || !dto.mensaje) {
        throw new Error("Mail y mensaje son obligatorios");
      }
      if (dto.mensaje.length < 5) {
        throw new Error("El mensaje es demasiado corto");
      }
      //console.log("SERVICIO: Transformando DTO a modelo");
      const modelo = pasarAModelo(dto);
      //console.log("SERVICIO: Guardando en base de datos");
      const id = await ContactoRepositorio.crear({
        mail: modelo.mail,
        mensaje: modelo.mensaje,
        creadoEn: modelo.creadoEn,
      });
      //console.log(`SERVICIO: Mensaje guardado en DB con ID: ${id}`);
      try {
        //console.log("SERVICIO: Enviando correo de notificación");
        await enviarCorreoContacto(modelo.mail, modelo.mensaje);
        //console.log("SERVICIO: Correo enviado exitosamente");
      } catch (emailError) {
        //console.error("ADVERTENCIA: El mensaje se guardó pero el correo no se pudo enviar:", emailError);
      }
      return {
        mensaje: "Mensaje recibido correctamente. Te contactaremos pronto 👍",
        id
      };
    } catch (error) {
      //console.error("SERVICIO: Error en ContactoServicio.crear:", error);
      throw error;
    }
  }

  static async listar(): Promise<ContactoDto[]> {
    try {
      const modelos = await ContactoRepositorio.listar();
      return modelos.map(m => pasarADto(m));
    } catch (error) {
      //console.error("SERVICIO: Error listando contactos:", error);
      throw error;
    }
  }
}