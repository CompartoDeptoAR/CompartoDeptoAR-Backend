import { body } from "express-validator";
import { validarCampos } from "../middlewares/validarCampos";

export const validarRegistroUsuario = [
  body("nombreCompleto")
    .isLength({ min: 3 })
    .withMessage("El nombre tiene que tener más de 3 letras."),

  body("contraseña")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
    .withMessage("La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número."),

  body("edad")
    .isInt({ min: 18 })
    .withMessage("La edad debe ser mayor o igual a 18."),

  validarCampos,
];
