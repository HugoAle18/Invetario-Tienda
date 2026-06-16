import { Router } from 'express'
import { authenticate } from '../middlewares/authMiddleware.js'
import { handleValidation } from '../middlewares/validationMiddleware.js'
import { idRule, crearRule } from '../validators/notificacionValidator.js'
import * as notificacionController from '../controllers/notificacionController.js'

const router = Router()

router.get('/', authenticate, notificacionController.listar)
router.get('/no-leidas', authenticate, notificacionController.obtenerNoLeidas)
router.get('/contar', authenticate, notificacionController.contarNoLeidas)
router.post('/', authenticate, crearRule, handleValidation, notificacionController.crear)
router.put('/:id/leer', authenticate, idRule, handleValidation, notificacionController.marcarLeida)
router.put('/leer-todas', authenticate, notificacionController.marcarTodasLeidas)

export default router
