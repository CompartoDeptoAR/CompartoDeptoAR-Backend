import { bucket } from "../config/firebase";
import { v4 as uuidv4 } from "uuid";

/**
 * Sube una imagen a Firebase Storage y devuelve la URL pública.
 * @param buffer Buffer del archivo (desde multer u otra fuente)
 * @param originalName Nombre original del archivo
 * @returns URL pública de la imagen
 */
export async function subirImagen(buffer: Buffer, originalName: string): Promise<string> {

  const nombreArchivo = `usuarios/${Date.now()}_${uuidv4()}_${originalName}`;

  const file = bucket.file(nombreArchivo);


  await file.save(buffer, {
    metadata: {
      contentType: "image/jpeg",
  }});

  await file.makePublic();

  return `https://storage.googleapis.com/${bucket.name}/${file.name}`;
}
