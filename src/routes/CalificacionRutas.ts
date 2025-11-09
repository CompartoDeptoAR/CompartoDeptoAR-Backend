import express from "express";
import { CalificacionController } from "../controllers/CalificacionControlador";
import { validarUsuariosRegistrados } from "../middlewares/validarUsuarioRegistrado";

const router = express.Router();

router.post("/", validarUsuariosRegistrados, CalificacionController.crear);
router.get("/:idUsuario", CalificacionController.obtenerPorUsuario);

export default router;
