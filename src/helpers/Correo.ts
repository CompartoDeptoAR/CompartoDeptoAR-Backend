import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function getFromEmail(): string {
  const fromEmail = process.env.EMAIL_USER;
  if (!fromEmail) {
    throw new Error("EMAIL_USER no encontrado en variables de entorno");
  }
  return fromEmail;
}

async function enviarCorreo(options: {to: string; subject: string;html: string;replyTo?: string;}): Promise<void> {

  const fromEmail = getFromEmail();

  const emailOptions = {
    from: fromEmail,
    to: options.to,
    subject: options.subject,
    html: options.html,
    ...(options.replyTo ? { reply_to: options.replyTo } : {})
  };

  const result = await resend.emails.send(emailOptions);

  if (result.error) {
    console.error("❌ Error enviando correo:", result.error);
    throw result.error;
  }
}


export async function enviarCorreoBienvenida(correo: string,nombreCompleto: string): Promise<void> {
  await enviarCorreo({
    to: correo,
    subject: "¡Bienvenido a CompartoDptoAr! 🎉",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">¡Bienvenido, ${nombreCompleto}! 🎉</h2>
        <p>Nos alegra mucho que te hayas unido a nuestra comunidad.</p>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;">Tu cuenta ha sido creada exitosamente. Ahora podes:</p>
          <ul>
            <li>Crear publicaciones</li>
            <li>Buscar y filtrar según tus preferencias</li>
            <li>Calificar y ser calificado</li>
            <li>Conectar con personas compatibles</li>
          </ul>
        </div>

        <p>Si tenés alguna duda, podés contactarnos desde la web.</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          Este es un correo automático, por favor no respondas.
        </p>
      </div>
    `
  });
}


export async function enviarCorreoRecuperacion(correo: string,token: string): Promise<void> {

  const enlace = `https://compartodeptoar.store/#/restablecer-contrasenia?token=${token}`;

  await enviarCorreo({
    to: correo,
    subject: "Recuperación de contraseña",
    html: `
      <p>Hace clic en el siguiente enlace para restablecer tu contraseña 🤘:</p>
      <a href="${enlace}">${enlace}</a>
      <p>Este enlace es válido por 30 minutos.</p>
    `
  });
}


export async function enviarCorreoEliminacionContenido( correo: string, motivo: string,tipo: "publicación" | "mensaje"): Promise<void> {
  await enviarCorreo({
    to: correo,
    subject: `Tu ${tipo} fue eliminada por moderación`,
    html: `
      <p>Hola 👋,</p>
      <p>Queremos informarte que tu ${tipo} fue eliminada por el equipo de moderación.</p>
      <p><strong>Motivo:</strong> ${motivo}</p>
      <br/>
      <p>Si pensás que es un error, podés responder este correo.</p>
      <p>Gracias por ayudarnos a mantener segura la comunidad 💛.</p>
    `
  });
}


export async function enviarCorreoContacto(mailUsuario: string,mensaje: string): Promise<void> {
  const fromEmail = getFromEmail();
    const contactEmail = process.env.CONTACT_EMAIL;
    if (!contactEmail) {
      throw new Error("CONTACT_EMAIL no configurado");
    }
  await enviarCorreo({
    to: process.env.CONTACT_EMAIL!,
    replyTo: mailUsuario,
    subject: "Nuevo mensaje desde el formulario de contacto",
    html: `
      <h3>Nuevo mensaje recibido 📩</h3>
      <p><strong>Mail del usuario:</strong> ${mailUsuario}</p>
      <p><strong>Mensaje:</strong></p>
      <p>${mensaje}</p>
      <br/>
      <p>Enviado automáticamente desde la web 👌</p>
    `
  });
}


export async function enviarCorreoCalificacionRecibida(correo: string,nombreCalificador: string,puntuacion: number,comentario: string): Promise<void> {

  const estrellas = "⭐".repeat(puntuacion);

  await enviarCorreo({
    to: correo,
    subject: `¡Recibiste una calificación de ${puntuacion} estrellas!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">¡Buenas nuevas!</h2>
        <p><strong>${nombreCalificador}</strong> te puso una calificación.</p>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 24px; text-align: center;">${estrellas}</p>
          <p style="text-align: center; color: #666;">
            Puntuación: ${puntuacion}/5
          </p>

          ${comentario ? `
            <div style="margin-top: 15px; border-top: 1px solid #ddd; padding-top: 15px;">
              <p><strong>Comentario:</strong></p>
              <p>"${comentario}"</p>
            </div>
          ` : ""}
        </div>

        <p>¡Gracias por ser parte de nuestra comunidad! 💛</p>
        <p style="color: #999; font-size: 12px;">
          Este es un correo automático, por favor no respondas.
        </p>
      </div>
    `
  });
}

export async function enviarCorreoReporteUsuario(
  usuarioReportadoId: string,
  usuarioReportanteId: string,
  motivo: string,
  descripcion?: string
): Promise<void> {

  const contactEmail = process.env.CONTACT_EMAIL;
  if (!contactEmail) {
    throw new Error("CONTACT_EMAIL no configurado");
  }

  await enviarCorreo({
    to: contactEmail,
    subject: "💩 Nuevo reporte de usuario",
    html: `
      <h2>Nuevo reporte recibido</h2>

      <p><strong>Usuario reportado ID:</strong> ${usuarioReportadoId}</p>
      <p><strong>Usuario que reporta ID:</strong> ${usuarioReportanteId}</p>
      <p><strong>Motivo:</strong> ${motivo}</p>

      ${descripcion ? `
        <p><strong>Descripción:</strong></p>
        <p>${descripcion}</p>
      ` : ""}

      <br/>
      <p>Revisar desde el panel de admin.</p>
    `
  });
}