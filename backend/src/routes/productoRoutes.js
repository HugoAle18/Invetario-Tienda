import { Router } from 'express'
import { authenticate, authorize } from '../middlewares/authMiddleware.js'
import { handleValidation } from '../middlewares/validationMiddleware.js'
import { crearRules, actualizarRules, idRule } from '../validators/productoValidator.js'
import * as productoController from '../controllers/productoController.js'

const router = Router()

router.get('/', authenticate, productoController.listar)
router.get('/:id', authenticate, idRule, handleValidation, productoController.obtener)
router.post('/', authenticate, authorize('administrador'), crearRules, handleValidation, productoController.crear)
router.put('/:id', authenticate, authorize('administrador'), actualizarRules, handleValidation, productoController.actualizar)
router.delete('/:id', authenticate, authorize('administrador'), idRule, handleValidation, productoController.eliminar)

export default router
