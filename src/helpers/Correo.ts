import nodemailer from "nodemailer";

export async function enviarCorreoRecuperacion(correo: string, token: string): Promise<void> {

  const enlace = `https://literate-broccoli-979p9jrpj9vpcpvvp-5173.app.github.dev/#/restablecer-contrasenia?token=${token}`;

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


export async function enviarCorreoEliminacionContenido(
  correo: string,
  motivo: string,
  tipo: "publicación" | "mensaje"
): Promise<void> {

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
    subject: `Tu ${tipo} fue eliminada por moderacion`,
    html: `
      <p>Hola 👋,</p>

      <p>Queremos informarte que tu ${tipo} fue eliminada por el equipo de moderacion.</p>

      <p><strong>Motivo de la eliminacion:</strong></p>
      <p>${motivo}</p>

      <br/>

      <p>Si pensas que es un error, podes responder este correo para que revisemos tu caso.</p>

      <p>Gracias por ayudarnos a mantener segura la comunidad 💛.</p>
    `,
  });
}
