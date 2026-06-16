import { Router } from 'express'
import { authenticate, authorize } from '../middlewares/authMiddleware.js'
import * as empleadoController from '../controllers/empleadoController.js'

const router = Router()

router.get('/panel', authenticate, authorize('empleado'), empleadoController.getPanel)

export default router
