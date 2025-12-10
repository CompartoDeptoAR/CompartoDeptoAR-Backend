import { Router } from "express";
import { PublicacionController } from "../controllers/PublicacionControlador";
import { validarUsuariosRegistrados } from "../middlewares/validarUsuarioRegistrado";

const router = Router();


router.post("/", validarUsuariosRegistrados, PublicacionController.crear);
router.get("/misPublicaciones", validarUsuariosRegistrados, PublicacionController.misPublicaciones);
router.get("/search", PublicacionController.buscar);
router.post("/buscarConFiltros", PublicacionController.buscarConFiltros);
router.get("/", PublicacionController.traerTodas);
router.get("/:id", PublicacionController.obtenerPorId);
router.put("/actualizar/:idPublicacion", validarUsuariosRegistrados, PublicacionController.actualizar);
router.delete("/eliminar/:id", validarUsuariosRegistrados, PublicacionController.eliminar);
router.patch("/:id", validarUsuariosRegistrados, PublicacionController.cambiarEstado);
router.delete("/eliminasPorusuario",validarUsuariosRegistrados, PublicacionController.eliminarPorUsuario);

export default router;