import express from "express";
import { CalificacionController } from "../controllers/CalificacionControlador";
import { validarUsuariosRegistrados } from "../middlewares/validarUsuarioRegistrado";
import { validarNoEsDuenio } from "../middlewares/validarNoEsDuenio";

const router = express.Router();

router.post("/", validarUsuariosRegistrados,validarNoEsDuenio, CalificacionController.crear);
router.get("/:idUsuario", CalificacionController.obtenerPorUsuario);

export default router;
