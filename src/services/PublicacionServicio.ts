//Tiempo al tiempo (?
import { Publicacion } from "../models/Publcacion";
import { pasarADto, pasarAModelo, PublicacionDto } from "../dtos/publicacionesDto";
import {PublicacionRepositorio} from "../repositories/PublicacionRepositorio"
import { database } from "firebase-admin";

export class PublicacionServicio{

    async crear (datos: PublicacionDto):Promise<PublicacionDto>{
        //Faltarian las validaciones
        const publicacion: Omit<Publicacion, "id"> = {
            titulo: datos.titulo,
            descripcion: datos.descripcion,
            precio: datos.precio,
            ubicacion: datos.ubicacion,
            foto: datos.foto,
            reglas: datos.reglas,
            preferencias: datos.preferencias,
            usuarioId: datos.usuarioId,
            estado: datos.estado,
            createdAt:datos.createdAt,
            updatedAt: datos.updatedAt,
        };

        const creada = await PublicacionRepositorio.crear(publicacion);

        return pasarADto(creada);
  }


    async traerTodas(): Promise<Publicacion[]>{
        const publicaciones = await PublicacionRepositorio.traerTodas();
         return publicaciones.map(p => pasarADto(p));
    }

     async actualizar(id: string, datos: Partial<PublicacionDto>): Promise<void> {
        throw Error("Method no implement")
     }

     async eliminar(id: string): Promise<void> {
        throw Error("Method no implement")
     }
}