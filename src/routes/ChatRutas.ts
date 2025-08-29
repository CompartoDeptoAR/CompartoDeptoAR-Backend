import { Router } from "express";
import { ChatController } from "../controllers/ChatContolador";
import { validarUsuariosRegistrados } from "../middlewares/validarUsuarioRegistrado";

const router = Router();

router.post("/", validarUsuariosRegistrados,ChatController.mandar);
router.get("/", validarUsuariosRegistrados, ChatController.obtener);

export default router;