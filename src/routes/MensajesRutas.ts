import { Router } from 'express';
import mensajeControlador from '../controllers/MensajeControlador';
import { validarUsuariosRegistrados } from '../middlewares/validarUsuarioRegistrado';
import { asyncHandler } from '../middlewares/async.middleware';

const router = Router();

router.use(validarUsuariosRegistrados);

router.post('/enviar', asyncHandler(mensajeControlador.enviarMensaje));
router.get('/:idPublicacion', asyncHandler(mensajeControlador.obtenerMensajes));
router.post('/marcarleidos', asyncHandler(mensajeControlador.marcarLeidos));//falta probar

export default router;