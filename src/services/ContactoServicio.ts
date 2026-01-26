import ContactoRepositorio from "../repository/ContactoRepositorio";
import { ContactoDto, pasarAModelo, pasarADto } from "../dtos/ContactoDto";
import { enviarCorreoContacto } from "../helpers/Correo";
import { AppError } from "../error/AppError";

export class ContactoServicio {

  static async crear(dto: ContactoDto): Promise<{ mensaje: string; id: string }> {
    //console.log("Iniciando proceso d contacto");

    if (!dto.mail || !dto.mensaje) {
      throw new AppError("Mail y mensaje son obligatorios", 400);
    }

    if (dto.mensaje.length < 5) {
      throw new AppError("El mensaje es muy corto", 400);
    }

    //console.log("Transformando DTO a modelo");
    const modelo = pasarAModelo(dto);

    //console.log("Guardando en base de datos");
    const id = await ContactoRepositorio.crear({
      mail: modelo.mail,
      mensaje: modelo.mensaje,
      creadoEn: modelo.creadoEn,
    });

    //console.log(`Mensaje guardado en DB con ID: ${id}`);

    try {
      //console.log("Enviando correo de notificación");
      await enviarCorreoContacto(modelo.mail, modelo.mensaje);
      //console.log("Correo enviado exitosamente");
    } catch (emailError) {
      console.error("ADVERTENCIA: El mensaje se guardo pero el correo no se pudo mandar:", emailError);
      throw emailError;
    }

    return {
      mensaje: "Mensaje recibido correctamente. Te contactaremos pronto 👍",
      id
    };
  }

  static async listar(): Promise<ContactoDto[]> {
    const modelos = await ContactoRepositorio.listar();
    return modelos.map(m => pasarADto(m));
  }
}