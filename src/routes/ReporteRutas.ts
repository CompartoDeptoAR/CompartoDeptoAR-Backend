import { Router } from "express";
import { ReporteController } from "../controllers/ReporteControolador";
import { validarUsuariosRegistrados } from "../middlewares/validarUsuarioRegistrado";

const router = Router();

router.post("/", validarUsuariosRegistrados,ReporteController.crear);
router.get("/:id", validarUsuariosRegistrados,ReporteController.obtener);


export default router;
