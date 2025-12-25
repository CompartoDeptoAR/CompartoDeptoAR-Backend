import { Router } from "express";
import { PublicacionController } from "../controllers/PublicacionControlador";
import { validarUsuariosRegistrados } from "../middlewares/validarUsuarioRegistrado";

const router = Router();


router.post("/", validarUsuariosRegistrados, PublicacionController.crear);
router.get("/misPublicaciones", validarUsuariosRegistrados, PublicacionController.misPublicaciones);
router.get("/search", PublicacionController.buscar);
router.post("/buscarConFiltros", PublicacionController.buscarConFiltros);
router.get("/", PublicacionController.traerTodas);
//ADMIN- MAS ADELANTE TENDRIA QUE HACER UN MIDDLWARE O ALGO AASI PARA CHECK Q SEAN ADMIN POSTA
router.get('/listar-eliminadas',validarUsuariosRegistrados,PublicacionController.obtenerEliminadas);
router.get("/:id", PublicacionController.obtenerPorId);
router.put("/actualizar/:idPublicacion", validarUsuariosRegistrados, PublicacionController.actualizar);
//Este es como para borrar la bd de las pub o sea para borrar definitivamente...es para admin
router.delete("/eliminar-hard/:id", validarUsuariosRegistrados, PublicacionController.eliminar);
//ADMIN
router.patch('/publicaciones/restaurar/:id',validarUsuariosRegistrados,PublicacionController.restaurar);
//eSTE ES PARA LOS USUARIOS COMUNES
router.delete("/eliminarSoft/:id", validarUsuariosRegistrados, PublicacionController.eliminarSoft);
router.patch("/:id", validarUsuariosRegistrados, PublicacionController.cambiarEstado);
router.delete("/eliminasPorusuario",validarUsuariosRegistrados, PublicacionController.eliminarPorUsuario);

export default router;