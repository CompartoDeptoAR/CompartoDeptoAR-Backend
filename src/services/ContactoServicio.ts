import ContactoRepositorio from "../repository/ContactoRepositorio";
import { ContactoDto, pasarAModelo, pasarADto } from "../dtos/ContactoDto";
import { enviarCorreoContacto } from "../helpers/Correo"

export class ContactoServicio {

  static async crear(dto: ContactoDto): Promise<{ mensaje: string; id: string }>  {
    const modelo = pasarAModelo(dto);

    const id = await ContactoRepositorio.crear({
      mail: modelo.mail,
      mensaje: modelo.mensaje,
      creadoEn: modelo.creadoEn,
    });

    await enviarCorreoContacto(modelo.mail, modelo.mensaje);

    return { mensaje: "Mensaje enviado correctamente 👍", id };
  }

  static async listar(): Promise<ContactoDto[]> {
    const modelos = await ContactoRepositorio.listar();
    return modelos.map(m => pasarADto(m));
  }
}
