  import nodemailer from "nodemailer";

export async function enviarCorreoRecuperacion(correo: string, token: string): Promise<void> {

  const enlace = `https://acaVaElFront/restablecer-contrasenia?token=${token}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "compartodeptoar@gmail.com",
      pass: "hhhk qfxo mypk zqhf",
    },
  });
  await transporter.sendMail({
    from: "Soporte <compartodeptoar@gmail.com>",
    to: correo,
    subject: "Recuperación de contraseña",
    html: `<p>Hace clic en el siguiente enlace para restablecer tu contraseña 🤘:</p>
           <a href="${enlace}">${enlace}</a>
           <p>Este enlace es valido por 30 minutos.</p>`,
  });

}