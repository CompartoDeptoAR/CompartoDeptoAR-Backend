import { Router } from "express";
import { ModeracionController } from "../controllers/ModeracionControlador";
import { validarUsuariosRegistrados } from "../middlewares/validarUsuarioRegistrado";
import { asyncHandler } from "../middlewares/async.middleware";

const router = Router();

router.get("/", validarUsuariosRegistrados, asyncHandler(ModeracionController.listarReportes));
router.post("/:idReporte/revisar", validarUsuariosRegistrados, asyncHandler(ModeracionController.revisarReporte));
router.delete("/:id", validarUsuariosRegistrados, asyncHandler(ModeracionController.eliminarPublicacion));
router.delete("/mensajes/:id", validarUsuariosRegistrados, asyncHandler(ModeracionController.eliminarMensaje));

export default router;