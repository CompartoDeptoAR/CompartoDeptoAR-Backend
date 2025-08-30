import { Router } from 'express';
import mensajeControlador from '../controllers/MensajeControlador';
import { validarUsuariosRegistrados } from '../middlewares/validarUsuarioRegistrado';

const router = Router();

router.use(validarUsuariosRegistrados);

router.post('/enviar', mensajeControlador.enviarMensaje);
router.get('/:idPublicacion', mensajeControlador.obtenerMensajes);
router.post('/marcarleidos', mensajeControlador.marcarLeidos);//falta probar

export default router;