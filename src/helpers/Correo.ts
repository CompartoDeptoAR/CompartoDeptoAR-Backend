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
//esto tdavia no anda, o sea anda pero no anda , fin.
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
    //console.log("Correo de recuperación enviado");
  } catch (error: any) {
    //console.error("Error enviando correo de recuperación:", error.message);
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
    //console.log("Correo de eliminación enviado");
  } catch (error: any) {
    //console.error("Error enviando correo de eliminación:", error.message);
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
    //console.log("Correo de contacto enviado");
  } catch (error: any) {
    //console.error("Error enviando correo de contacto:", error.message);
    throw error;
  }
}

export async function enviarCorreoCalificacionRecibida(correo: string, nombreCalificador: string,puntuacion: number,comentario: string): Promise<void> {
  try {
    configurarSendGrid();
    const fromEmail = getFromEmail();
    const estrellas = "⭐".repeat(puntuacion);

    const msg = {
      to: correo,
      from: fromEmail,
      subject: `¡Recibiste una calificacion de ${puntuacion} estrellas! ⭐`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">¡Buenas nuevas!</h2>
          <p>Hola,</p>
          <p><strong>${nombreCalificador}</strong> te puso una calificacion.</p>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 24px; text-align: center;">${estrellas}</p>
            <p style="text-align: center; color: #666; margin: 10px 0;">Puntuación: ${puntuacion}/5</p>
            ${comentario ? `
              <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">
                <p style="margin: 0; color: #666;"><strong>Comentario:</strong></p>
                <p style="margin: 10px 0; color: #555;">"${comentario}"</p>
              </div>
            ` : ''}
          </div>

          <p>¡Gracias por ser parte de nuestra comunidad! 💛</p>
          <p style="color: #999; font-size: 12px;">Este es un correo automático, por favor no respondas a este mensaje.</p>
        </div>
      `,
    };
    await sgMail.send(msg);
  } catch (error: any) {
    console.error("Error enviando correo de calificacion:", error.message);
    throw error;
  }
}
