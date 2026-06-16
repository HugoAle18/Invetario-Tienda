import { Router } from 'express'
import { authenticate, authorize } from '../middlewares/authMiddleware.js'
import { handleValidation } from '../middlewares/validationMiddleware.js'
import { crearRules, actualizarRules, idRule } from '../validators/categoriaValidator.js'
import * as categoriaController from '../controllers/categoriaController.js'

const router = Router()

router.get('/', authenticate, categoriaController.listar)
router.get('/:id', authenticate, idRule, handleValidation, categoriaController.obtener)
router.post('/', authenticate, authorize('administrador'), crearRules, handleValidation, categoriaController.crear)
router.put('/:id', authenticate, authorize('administrador'), actualizarRules, handleValidation, categoriaController.actualizar)
router.delete('/:id', authenticate, authorize('administrador'), idRule, handleValidation, categoriaController.eliminar)

export default router
