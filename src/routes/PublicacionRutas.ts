import { Router } from "express";
import {PublicacionController} from "../controllers/PublicacionControlador";
import { validarUsuariosRegistrados } from "../middlewares/validarUsuarioRegistrado";

const router = Router();
router.post("/", validarUsuariosRegistrados, PublicacionController.crear);
router.get("/misPublicaciones",validarUsuariosRegistrados, PublicacionController.misPublicaciones);
router.get("/", PublicacionController.traerTodas);
router.get("/:id",PublicacionController.obtenerPorId);
router.put("/actualizar/:idPublicacion", validarUsuariosRegistrados,PublicacionController.actualizar);
router.delete("/eliminar/:id",PublicacionController.eliminar); // check q sea admin o el q creo la publi
router.get("/buscar/:texto",PublicacionController.buscar);
router.post("/buscarConFiltros", PublicacionController.buscarConFiltros);

export default router;