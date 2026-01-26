import { Router } from "express";
import { CalificacionController } from "../controllers/CalificacionControlador";
import { validarUsuariosRegistrados } from "../middlewares/validarUsuarioRegistrado";
import { asyncHandler } from "../middlewares/async.middleware";

const router = Router();

router.post("/", validarUsuariosRegistrados, asyncHandler(CalificacionController.crear));
router.get("/:idUsuario/promedio", asyncHandler(CalificacionController.obtenerPromedio));
router.get("/:idUsuario", asyncHandler(CalificacionController.obtenerPorUsuario));

export default router;