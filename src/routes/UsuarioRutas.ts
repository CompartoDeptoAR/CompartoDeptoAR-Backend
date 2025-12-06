import { Router } from "express";
import { UsuarioController } from "../controllers/UsuarioControlador";
import { validarUsuariosRegistrados } from "../middlewares/validarUsuarioRegistrado";
import { validarRegistroUsuario } from "../helpers/UsuarioValidaciones";
import multer from "multer";

const router = Router();
const upload = multer();

router.post("/", validarRegistroUsuario, UsuarioController.registrar);
router.post("/rol", validarUsuariosRegistrados, UsuarioController.asignarRol);
router.get("/perfil", validarUsuariosRegistrados, UsuarioController.traerPerfil);
router.put("/perfil", validarUsuariosRegistrados, UsuarioController.actualizarPerfil);
router.delete("/rol", validarUsuariosRegistrados, UsuarioController.sacarRol);
router.delete("/:id",validarUsuariosRegistrados, UsuarioController.eliminar);
router.get("/habitos-preferencias", validarUsuariosRegistrados, UsuarioController.obtenerHabitosYPreferencias);
//router.get("/:id", UsuarioController.obtenerUsuarioPorId);
router.get("/:id", UsuarioController.obtenerPerfilDeUsuarioPorId);
router.post("/subir-foto", upload.single("foto"), UsuarioController.subirFoto);

export default router;
