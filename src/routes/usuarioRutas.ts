import { Router } from "express";
import { body } from "express-validator";
import { UsuarioController } from "../controllers/UsuarioControlador";
import { validarCampos } from "../middlewares/validarCampos";
import { validarUsuariosRegistrados } from "../middlewares/validarUsuarioRegistrado";

const router = Router();

router.post("/",[
    body("nombreCompleto").isLength({ min: 3 }).withMessage("El nombre tiene que tener +3 letras."),
    body("contraseña")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
    .withMessage("La contraseña tiene q tener al menos 8 caracteres, una mayuscula, una minuscula y un numero."),
    body("edad").isInt({ min: 18 }).withMessage("La edad tiene que ser mayor o igual a 18, o sea, tenes que ser mayor de edad."),
    validarCampos,
  ],
  UsuarioController.registrar);
//tamb podria hacer un borrar rol o algo asi, las funcion ya esta....
router.post("/rol", validarUsuariosRegistrados,UsuarioController.asignarRol);
router.get("/perfil", validarUsuariosRegistrados, UsuarioController.traerPerfil);
router.put("/perfil", validarUsuariosRegistrados, UsuarioController.actualizarPerfil);

export default router;
