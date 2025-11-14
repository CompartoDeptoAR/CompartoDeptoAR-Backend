import { Router } from "express";
import { ModeracionController } from "../controllers/ModeracionControlador";
import { validarUsuariosRegistrados } from "../middlewares/validarUsuarioRegistrado";

const router = Router();

router.get("/", validarUsuariosRegistrados, ModeracionController.listarReportes);
router.post("/:idReporte/revisar", validarUsuariosRegistrados, ModeracionController.revisarReporte);
router.delete("/publicaciones/:id", validarUsuariosRegistrados, ModeracionController.eliminarPublicacion);
router.delete("/mensajes/:id", validarUsuariosRegistrados, ModeracionController.eliminarMensaje);

export default router;