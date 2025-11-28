import sgMail from "@sendgrid/mail";

const apiKey = process.env.SENDGRID_API_KEY;
const fromEmail = process.env.EMAIL_USER;

if (!apiKey) {
  console.warn("⚠️ Advertencia: Falta SENDGRID_API_KEY en variables de entorno. Los correos no se enviarán.");
}
if (!fromEmail) {
  console.warn("⚠️ Advertencia: Falta EMAIL_USER en variables de entorno. Los correos no se enviarán.");
}
if (apiKey) {
  sgMail.setApiKey(apiKey);
}

const FROM = fromEmail || "no-reply@mail.com";

export async function enviarCorreoRecuperacion(correo: string, token: string): Promise<void> {
  if (!apiKey) return console.warn("Intento de enviar correo de recuperación, pero falta SENDGRID_API_KEY.");

  const enlace = `https://compartodeptoar.store/#/restablecer-contrasenia?token=${token}`;

  const msg = {
    to: correo,
    from: FROM,
    subject: "Recuperación de contraseña",
    html: `
      <p>Hace clic en el siguiente enlace para restablecer tu contraseña 🤘:</p>
      <a href="${enlace}">${enlace}</a>
      <p>Este enlace es válido por 30 minutos.</p>
    `,
  };

  await sgMail.send(msg);
  console.log("📧 Correo de recuperación enviado");
}

export async function enviarCorreoEliminacionContenido(correo: string, motivo: string, tipo: "publicación" | "mensaje"): Promise<void> {
  if (!apiKey) return console.warn("Intento de enviar correo de eliminación, pero falta SENDGRID_API_KEY.");

  const msg = {
    to: correo,
    from: FROM,
    subject: `Tu ${tipo} fue eliminada por moderación`,
    html: `
      <p>Hola 👋,</p>
      <p>Queremos informarte que tu ${tipo} fue eliminada por el equipo de moderación.</p>
      <p><strong>Motivo de la eliminación:</strong> ${motivo}</p>
      <br/>
      <p>Si pensás que es un error, podés responder este correo para que revisemos tu caso.</p>
      <p>Gracias por ayudarnos a mantener segura la comunidad 💛.</p>
    `,
  };

  await sgMail.send(msg);
  console.log("📧 Correo de eliminación enviado");
}

export async function enviarCorreoContacto(mailUsuario: string, mensaje: string): Promise<void> {
  if (!apiKey) return console.warn("Intento de enviar correo de contacto, pero falta SENDGRID_API_KEY.");

  const msg = {
    to: FROM,
    from: FROM,
    replyTo: mailUsuario,
    subject: "Nuevo mensaje desde el formulario de contacto",
    html: `
      <h3>Nuevo mensaje recibido 📩</h3>
      <p><strong>Mail del usuario:</strong> ${mailUsuario}</p>
      <p><strong>Mensaje:</strong></p>
      <p>${mensaje}</p>
      <br/>
      <p>Enviado automáticamente desde la web 👌</p>
    `,
  };

  await sgMail.send(msg);
  console.log("📧 Correo de contacto enviado");
}
