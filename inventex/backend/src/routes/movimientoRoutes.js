import { Router } from 'express'
import { authenticate } from '../middlewares/authMiddleware.js'
import { handleValidation } from '../middlewares/validationMiddleware.js'
import { entradaRules, salidaRules } from '../validators/movimientoValidator.js'
import * as movimientoController from '../controllers/movimientoController.js'

const router = Router()

router.get('/', authenticate, movimientoController.listar)
router.post('/entrada', authenticate, entradaRules, handleValidation, movimientoController.registrarEntrada)
router.post('/salida', authenticate, salidaRules, handleValidation, movimientoController.registrarSalida)

export default router
