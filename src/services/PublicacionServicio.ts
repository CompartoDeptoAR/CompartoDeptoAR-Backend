//Tiempo al tiempo (?
import { Publicacion } from "../models/Publcacion";
import { pasarADto, pasarAModelo, PublicacionDto } from "../dtos/publicacionesDto";
import {PublicacionRepositorio} from "../repositories/PublicacionRepositorio"
import { database } from "firebase-admin";

export class PublicacionServicio{

    async crear(datos: PublicacionDto): Promise<PublicacionDto> {
    if (!datos.titulo || datos.titulo.trim().length < 3) {
        throw { status: 400, message: "El título debe tener al menos 3 caracteres" };
    }

    const publicacion: Omit<Publicacion, "id"> = pasarAModelo(datos);
    const creada = await PublicacionRepositorio.crear(publicacion);
    return pasarADto(creada);
    }


    async traerTodas(): Promise<PublicacionDto[]>{
        const publicaciones = await PublicacionRepositorio.traerTodas();
         return publicaciones.map(p => pasarADto(p));
    }

     async actualizar(id: string, datos: Partial<PublicacionDto>): Promise<void> {
        const publicacion = await PublicacionRepositorio.actualizar(id, datos);
        return publicacion;
     }

     async eliminar(id: string): Promise<void> {
        const publicacion = await PublicacionRepositorio.eliminar(id);
        return publicacion;
     }
}