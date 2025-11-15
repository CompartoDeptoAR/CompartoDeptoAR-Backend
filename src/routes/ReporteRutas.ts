import { Router } from "express";
import { ReporteController } from "../controllers/ReporteControolador";

const router = Router();

router.post("/", ReporteController.crear); ///si
router.get("/", ReporteController.listar); //si
router.get("/:id", ReporteController.obtener);//si
router.put("/:id", ReporteController.marcarRevisado);

export default router;
