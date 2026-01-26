import { Router } from "express";
import { UsuarioController } from "../controllers/UsuarioControlador";
import { validarUsuariosRegistrados } from "../middlewares/validarUsuarioRegistrado";
import { validarRegistroUsuario } from "../helpers/UsuarioValidaciones";
import { validarEmailMiddleware } from "../middlewares/validarEmail";
import { asyncHandler } from "../middlewares/async.middleware";

const router = Router();

router.get('/usuarios', asyncHandler(UsuarioController.listarTodos));
router.post("/", validarEmailMiddleware,validarRegistroUsuario, asyncHandler(UsuarioController.registrar));
router.post("/asignar-rol", validarUsuariosRegistrados, asyncHandler(UsuarioController.asignarRol));
router.get("/perfil", validarUsuariosRegistrados, asyncHandler(UsuarioController.traerPerfil));
router.patch("/perfil", validarUsuariosRegistrados, asyncHandler(UsuarioController.actualizarPerfil));
router.post("/sacar-rol", validarUsuariosRegistrados, asyncHandler(UsuarioController.sacarRol));
router.delete("/:id",validarUsuariosRegistrados, asyncHandler(UsuarioController.eliminar));
router.delete('/cuenta/eliminar', validarUsuariosRegistrados, asyncHandler(UsuarioController.eliminarMiCuenta));
router.get("/habitos-preferencias", validarUsuariosRegistrados, asyncHandler(UsuarioController.obtenerHabitosYPreferencias));
//router.get("/:id", UsuarioController.obtenerUsuarioPorId);
router.get("/:id", asyncHandler(UsuarioController.obtenerPerfilDeUsuarioPorId));
//router.post("/subir-foto", upload.single("foto"), UsuarioController.subirFoto);

export default router;
