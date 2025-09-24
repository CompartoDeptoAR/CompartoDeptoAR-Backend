//Tiempo al tiempo (?
import { FiltrosBusqueda, Publicacion } from "../models/Publcacion";
import { pasarADto, pasarAModelo, PublicacionDto } from "../dtos/publicacionesDto";
import {PublicacionRepositorio} from "../repositories/PublicacionRepositorio"

export class PublicacionServicio{

    async crear(datos: PublicacionDto): Promise<PublicacionDto> {
    if (!datos.titulo || datos.titulo.trim().length < 3) {
        throw { status: 400, message: "El título debe tener al menos 3 caracteres" };
    }

    const publicacion: Omit<Publicacion, "id"> = pasarAModelo(datos);
    const creada = await PublicacionRepositorio.crear(publicacion);
    return pasarADto(creada);
    }

    async misPublicaciones(usuarioId: string): Promise<PublicacionDto[]>{
        const misPublicaciones= await PublicacionRepositorio.misPublicaciones(usuarioId);
        return misPublicaciones.map(p => pasarADto(p));
    }

    async traerTodas(): Promise<PublicacionDto[]>{
        const publicaciones = await PublicacionRepositorio.traerTodas();
         return publicaciones.map(p => pasarADto(p));
    }


    async actualizar(idUsuario: string, idPublicacion: string, datos: Partial<Publicacion>): Promise<void>{
        const publicacionActualizada= await PublicacionRepositorio.actualizar(idUsuario,idPublicacion, datos);
        return publicacionActualizada;
    }

     async eliminar(id: string): Promise<void> {
        const publicacion = await PublicacionRepositorio.eliminar(id);
        return publicacion;
     }

     async buscar (texto:string):Promise<PublicacionDto[]>{
        return await PublicacionRepositorio.buscar(texto);
    }

    async buscarConFiltros(filtros: FiltrosBusqueda): Promise<PublicacionDto[]> {
        const publicaciones = await PublicacionRepositorio.buscarConFiltros(filtros);
        if (publicaciones.length === 0) {
            throw { status: 404, message: "No se encontraron publicaciones con esos filtros." };
        }

        return publicaciones.map(p => pasarADto(p));
    }
}