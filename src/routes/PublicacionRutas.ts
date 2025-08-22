import { Router } from "express";
import {PublicacionController} from "../controllers/PublicacionControlador";

const router = Router();

router.post("/", PublicacionController.crear);
router.get("/", PublicacionController.traerTodas);
router.put("/actualizar/:id", PublicacionController.actualizar);
router.delete("/eliminar/:id",PublicacionController.eliminar);

export default router;