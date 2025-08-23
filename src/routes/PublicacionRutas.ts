import { Router } from "express";
import {PublicacionController} from "../controllers/PublicacionControlador";

const router = Router();

router.post("/", PublicacionController.crear);
router.get("/", PublicacionController.traerTodas);
router.put("/actualizar/:id", PublicacionController.actualizar);
router.delete("/eliminar/:id",PublicacionController.eliminar);
//si existe pero aun no lo hago, solo es para dejarlo listo para arrancar...
router.get("/buscar",PublicacionController.buscar);//<--Nose si queda mejor asi con los parametros en la url o como un Post con un body...

export default router;