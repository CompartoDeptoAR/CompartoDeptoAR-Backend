import { Router } from "express";
import { UsuarioControlador } from "../controllers/UsuarioControlador";

const router = Router();
const usuarioControlador = new UsuarioControlador();

router.post("/registrar", (req, res) => usuarioControlador.registrar(req, res));

export default router;
