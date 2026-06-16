import { Router } from 'express'
import { authenticate, authorize } from '../middlewares/authMiddleware.js'
import { handleValidation } from '../middlewares/validationMiddleware.js'
import { crearRules, actualizarRules, idRule } from '../validators/usuarioValidator.js'
import * as usuarioController from '../controllers/usuarioController.js'

const router = Router()

router.get('/', authenticate, authorize('administrador'), usuarioController.listar)
router.get('/:id', authenticate, authorize('administrador'), idRule, handleValidation, usuarioController.obtener)
router.post('/', authenticate, authorize('administrador'), crearRules, handleValidation, usuarioController.crear)
router.put('/:id', authenticate, authorize('administrador'), actualizarRules, handleValidation, usuarioController.actualizar)
router.patch('/:id/toggle-activo', authenticate, authorize('administrador'), idRule, handleValidation, usuarioController.toggleActivo)

export default router
