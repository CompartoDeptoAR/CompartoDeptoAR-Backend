import { Router } from "express";
import { PublicacionController } from "../controllers/PublicacionControlador";
import { validarUsuariosRegistrados } from "../middlewares/validarUsuarioRegistrado";
import { asyncHandler } from "../middlewares/async.middleware";

const router = Router();

router.post("/", validarUsuariosRegistrados, asyncHandler(PublicacionController.crear));
router.get("/misPublicaciones", validarUsuariosRegistrados, asyncHandler(PublicacionController.misPublicaciones));
router.get("/search", asyncHandler(PublicacionController.buscar));
router.post("/buscarConFiltros", asyncHandler(PublicacionController.buscarConFiltros));
router.get("/admin/todas", asyncHandler(PublicacionController.traerTodasAdmin));
router.get('/listar-eliminadas', validarUsuariosRegistrados, asyncHandler(PublicacionController.obtenerEliminadas));
router.get("/", asyncHandler(PublicacionController.traerTodas));
router.get("/:id", asyncHandler(PublicacionController.obtenerPorId));
router.put("/actualizar/:idPublicacion", validarUsuariosRegistrados, asyncHandler(PublicacionController.actualizar));
router.delete("/eliminar-hard/:id", validarUsuariosRegistrados, asyncHandler(PublicacionController.eliminar));
router.patch('/publicaciones/restaurar/:id', validarUsuariosRegistrados, asyncHandler(PublicacionController.restaurar));
router.delete("/eliminarSoft/:id", validarUsuariosRegistrados, asyncHandler(PublicacionController.eliminarSoft));
router.patch("/:id", validarUsuariosRegistrados, asyncHandler(PublicacionController.cambiarEstado));
router.delete("/eliminasPorusuario", validarUsuariosRegistrados, asyncHandler(PublicacionController.eliminarPorUsuario));

export default router;