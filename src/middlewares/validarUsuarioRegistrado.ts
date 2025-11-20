import { ServicioJWT} from '../services/ServicioJWT'
import { NextFunction, Request, Response } from "express";

export interface RequestConUsuarioId extends Request {
    usuarioId?: string | null;
}

export function validarUsuariosRegistrados(req: RequestConUsuarioId, res: Response, next: NextFunction) {
    const tokenHeader = req.headers.authorization;
    if (!tokenHeader) {
        return res.status(401).json({ error: "Tenes que iniciar sesion" });
    }
    const token = tokenHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "Token invalido" });
    }
    if (!ServicioJWT.validarToken(token)) {
        return res.status(401).json({ error: "Token invalido o expirado" });
    }
    const usuarioId = ServicioJWT.extraerIdUsuario(token);
    req.usuarioId = usuarioId;
    next();
}
