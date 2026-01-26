import { Router } from "express";
import { ContactoController } from "../controllers/ContactoControlador";
//import { validarEmailMiddleware } from "../middlewares/validarEmail";
import { asyncHandler } from "../middlewares/async.middleware";

const router = Router();

router.post("/", asyncHandler(ContactoController.crear));
router.get("/", asyncHandler(ContactoController.listar));

export default router;