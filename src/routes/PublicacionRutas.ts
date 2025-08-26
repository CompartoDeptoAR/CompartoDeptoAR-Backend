import { Router } from "express";
import {PublicacionController} from "../controllers/PublicacionControlador";
import { validarUsuariosRegistrados } from "../middlewares/validarUsuarioRegistrado";

const router = Router();

router.post("/", PublicacionController.crear);
router.get("/misPublicaciones",validarUsuariosRegistrados, PublicacionController.misPublicaciones);
router.get("/", PublicacionController.traerTodas);
router.put("/actualizar/:id", validarUsuariosRegistrados,PublicacionController.actualizar);
router.delete("/eliminar/:id",PublicacionController.eliminar);
router.get("/buscar:texto",PublicacionController.buscar);//viaja en la url: /buscar?texto=palermo
//<--Esto seria para la que no hice aun : Nose si queda mejor asi con los parametros en la url o como un Post con un body...

export default router;