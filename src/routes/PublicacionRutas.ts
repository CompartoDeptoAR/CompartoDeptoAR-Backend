import { Router } from "express";
import {PublicacionController} from "../controllers/PublicacionControlador";

const router = Router();

router.post("/", PublicacionController.crear);
router.get("/", PublicacionController.traerTodas);

export default router;