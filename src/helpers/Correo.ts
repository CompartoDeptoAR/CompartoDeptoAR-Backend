import sgMail from "@sendgrid/mail";

function getApiKey(): string {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    throw new Error("SENDGRID_API_KEY no encontrada en variables de entorno");
  }
  return apiKey;
}

function getFromEmail(): string {
  const fromEmail = process.env.EMAIL_USER;
  if (!fromEmail) {
    throw new Error("EMAIL_USER no encontrado en variables de entorno");
  }
  return fromEmail;
}

function configurarSendGrid() {
  const apiKey = getApiKey();
  sgMail.setApiKey(apiKey);
  console.log('SendGrid configurado correctamente');
}

export async function enviarCorreoRecuperacion(correo: string, token: string): Promise<void> {
  try {
    configurarSendGrid();
    const fromEmail = getFromEmail();

    const enlace = `https://compartodeptoar.store/#/restablecer-contrasenia?token=${token}`;

    const msg = {
      to: correo,
      from: fromEmail,
      subject: "Recuperación de contraseña",
      html: `
        <p>Hace clic en el siguiente enlace para restablecer tu contraseña 🤘:</p>
        <a href="${enlace}">${enlace}</a>
        <p>Este enlace es válido por 30 minutos.</p>
      `,
    };

    await sgMail.send(msg);
    console.log("📧 Correo de recuperación enviado");
  } catch (error: any) {
    console.error("Error enviando correo de recuperación:", error.message);
    throw error;
  }
}

export async function enviarCorreoEliminacionContenido(correo: string, motivo: string, tipo: "publicación" | "mensaje"): Promise<void> {
  try {
    configurarSendGrid();
    const fromEmail = getFromEmail();

    const msg = {
      to: correo,
      from: fromEmail,
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
  } catch (error: any) {
    console.error("❌ Error enviando correo de eliminación:", error.message);
    throw error;
  }
}

export async function enviarCorreoContacto(mailUsuario: string, mensaje: string): Promise<void> {
  try {
    configurarSendGrid();
    const fromEmail = getFromEmail();

    const msg = {
      to: fromEmail,
      from: fromEmail,
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
  } catch (error: any) {
    console.error("Error enviando correo de contacto:", error.message);
    throw error;
  }
}