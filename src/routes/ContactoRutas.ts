import { Router } from "express";
import { ContactoController } from "../controllers/ContactoControlador";

const router = Router();

router.post("/", ContactoController.crear);
router.get("/", ContactoController.listar);

export default router;