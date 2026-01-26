import { Router } from "express";
import { FavoritoController } from "../controllers/FavoritoControlador";
import { validarUsuariosRegistrados } from "../middlewares/validarUsuarioRegistrado";
import { asyncHandler } from "../middlewares/async.middleware";

const router = Router();

router.post("/", validarUsuariosRegistrados, asyncHandler(FavoritoController.agregar));
router.delete("/:publicacionId", validarUsuariosRegistrados, asyncHandler(FavoritoController.eliminar));
router.get("/", validarUsuariosRegistrados, asyncHandler(FavoritoController.listarFavoritos));

export default router;