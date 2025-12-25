import { Router } from "express";
import { CalificacionController } from "../controllers/CalificacionControlador";
import { validarUsuariosRegistrados } from "../middlewares/validarUsuarioRegistrado";

const router = Router();

router.post("/", validarUsuariosRegistrados, CalificacionController.crear);
router.get("/:idUsuario/promedio", CalificacionController.obtenerPromedio);
router.get("/:idUsuario", CalificacionController.obtenerPorUsuario);

export default router;