import { Router } from "express";
import { RecuperacionController } from "../controllers/RecuperacionControlador";

const router = Router();

router.post("/solicitarRecuperacion", RecuperacionController.solicitarRecuperacion);
router.post("/restablecerContrasenia", RecuperacionController.restablecerContrasenia);

export default router;
