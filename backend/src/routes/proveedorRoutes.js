import { Router } from 'express'
import { authenticate, authorize } from '../middlewares/authMiddleware.js'
import { handleValidation } from '../middlewares/validationMiddleware.js'
import { crearRules, actualizarRules, idRule } from '../validators/proveedorValidator.js'
import * as proveedorController from '../controllers/proveedorController.js'

const router = Router()

router.get('/', authenticate, proveedorController.listar)
router.get('/:id', authenticate, idRule, handleValidation, proveedorController.obtener)
router.post('/', authenticate, authorize('administrador'), crearRules, handleValidation, proveedorController.crear)
router.put('/:id', authenticate, authorize('administrador'), actualizarRules, handleValidation, proveedorController.actualizar)
router.delete('/:id', authenticate, authorize('administrador'), idRule, handleValidation, proveedorController.eliminar)

export default router
