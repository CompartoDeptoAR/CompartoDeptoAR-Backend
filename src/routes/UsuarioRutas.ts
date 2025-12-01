import { Router } from "express";
import { UsuarioController } from "../controllers/UsuarioControlador";
import { validarUsuariosRegistrados } from "../middlewares/validarUsuarioRegistrado";
import { validarRegistroUsuario } from "../helpers/UsuarioValidaciones";

const router = Router();

router.post("/", validarRegistroUsuario, UsuarioController.registrar);
router.post("/rol", validarUsuariosRegistrados, UsuarioController.asignarRol);
router.get("/perfil", validarUsuariosRegistrados, UsuarioController.traerPerfil);
router.put("/perfil", validarUsuariosRegistrados, UsuarioController.actualizarPerfil);
router.delete("/rol", validarUsuariosRegistrados, UsuarioController.sacarRol);
router.get("/habitos-preferencias", validarUsuariosRegistrados, UsuarioController.obtenerHabitosYPreferencias);
router.get("/:id", UsuarioController.obtenerUsuarioPorId);

export default router;
