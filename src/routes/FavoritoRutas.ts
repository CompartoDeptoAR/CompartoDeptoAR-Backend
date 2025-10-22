import { Router } from "express";
import { FavoritoController } from "../controllers/FavoritoControlador";
import { validarUsuariosRegistrados } from "../middlewares/validarUsuarioRegistrado";

const router = Router();

router.post("/", validarUsuariosRegistrados, FavoritoController.agregar);
router.delete("/:publicacionId", validarUsuariosRegistrados, FavoritoController.eliminar);
router.get("/", validarUsuariosRegistrados, FavoritoController.listarFavoritos);

export default router;
