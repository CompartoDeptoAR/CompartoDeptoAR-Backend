import sgMail from "@sendgrid/mail";


const apiKey = process.env.SENDGRID_API_KEY;
const fromEmail = process.env.EMAIL_USER;

if (!apiKey) {
  console.error("❌ ERROR: Falta SENDGRID_API_KEY en variables de entorno.");
  throw new Error("Falta SENDGRID_API_KEY");
}

if (!fromEmail) {
  console.error("❌ ERROR: Falta EMAIL_FROM en variables de entorno.");
  throw new Error("Falta EMAIL_FROM");
}

const FROM = fromEmail as string;

sgMail.setApiKey(apiKey);


export async function enviarCorreoRecuperacion(correo: string, token: string): Promise<void> {
  const enlace = `https://literate-broccoli-979p9jrpj9vpcpvvp-5173.app.github.dev/#/restablecer-contrasenia?token=${token}`;

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

export async function enviarCorreoEliminacionContenido(
  correo: string,
  motivo: string,
  tipo: "publicación" | "mensaje"
): Promise<void> {

  const msg = {
    to: correo,
    from: FROM,
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
  };

  await sgMail.send(msg);
  console.log("📧 Correo de eliminación enviado");
}

export async function enviarCorreoContacto(mailUsuario: string, mensaje: string): Promise<void> {

  const msg = {
    to: FROM,     // vos recibís el mensaje
    from: FROM,   // remitente verificado
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
