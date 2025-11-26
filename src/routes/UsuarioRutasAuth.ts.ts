import { Router } from "express";
import { body } from "express-validator";
import { UsuarioController } from "../controllers/UsuarioControlador";
import { validarCampos } from "../middlewares/validarCampos";

const UsuarioRutasAuth = Router();

UsuarioRutasAuth.post(
  "/",
  [
    body("nombreCompleto").isLength({ min: 3 }).withMessage("El nombre tiene que tener +3 letras."),
    body("correo").isEmail().withMessage("El correo no es valido, tiene q ser: xxxxxx@servidorDeMail.com ."),
    body("contraseña")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
    .withMessage("La contraseña tiene q tener al menos 8 caracteres, una mayuscula, una minuscula y un numero."),
    body("edad").isInt({ min: 18 }).withMessage("La edad tiene que ser mayor o igual a 18, o sea, tenes que ser mayor de edad."),
    validarCampos,
  ],
  UsuarioController.registrar
);

UsuarioRutasAuth.put("/perfil/:id", UsuarioController.actualizarPerfil);

export default UsuarioRutasAuth;
