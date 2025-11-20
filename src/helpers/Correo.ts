import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "compartodeptoar@gmail.com",
    pass: "hhhk qfxo mypk zqhf",
  },
});

export async function enviarCorreoRecuperacion(correo: string, token: string): Promise<void> {
  const enlace = `https://literate-broccoli-979p9jrpj9vpcpvvp-5173.app.github.dev/#/restablecer-contrasenia?token=${token}`;

  await transporter.sendMail({
    from: "Soporte <compartodeptoar@gmail.com>",
    to: correo,
    subject: "Recuperación de contraseña",
    html: `
      <p>Hace clic en el siguiente enlace para restablecer tu contraseña 🤘:</p>
      <a href="${enlace}">${enlace}</a>
      <p>Este enlace es válido por 30 minutos.</p>
    `,
  });
}

export async function enviarCorreoEliminacionContenido(
  correo: string,
  motivo: string,
  tipo: "publicación" | "mensaje"
): Promise<void> {

  await transporter.sendMail({
    from: "Soporte <compartodeptoar@gmail.com>",
    to: correo,
    subject: `Tu ${tipo} fue eliminada por moderación`,
    html: `
      <p>Hola 👋,</p>

      <p>Queremos informarte que tu ${tipo} fue eliminada por el equipo de moderación.</p>

      <p><strong>Motivo de la eliminación:</strong></p>
      <p>${motivo}</p>

      <br/>

      <p>Si pensás que es un error, podés responder este correo para que revisemos tu caso.</p>

      <p>Gracias por ayudarnos a mantener segura la comunidad 💛.</p>
    `,
  });
}

export async function enviarCorreoContacto(mailUsuario: string, mensaje: string): Promise<void> {
  await transporter.sendMail({
    from: "Contacto <compartodeptoar@gmail.com>",
    to: "compartodeptoar@gmail.com",
    subject: "Nuevo mensaje desde el formulario de contacto",
    html: `
      <h3>Nuevo mensaje recibido 📩</h3>

      <p><strong>Mail del usuario:</strong> ${mailUsuario}</p>

      <p><strong>Mensaje:</strong></p>
      <p>${mensaje}</p>

      <br/>
      <p>Enviado automáticamente desde la web 👌</p>
    `,
  });
}
