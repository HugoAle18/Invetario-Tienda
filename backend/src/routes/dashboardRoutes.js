import { Router } from 'express'
import { authenticate } from '../middlewares/authMiddleware.js'
import * as dashboardController from '../controllers/dashboardController.js'

const router = Router()

router.get('/admin', authenticate, dashboardController.getAdmin)
router.get('/movimientos-recientes', authenticate, dashboardController.getMovimientosRecientes)
router.get('/alertas-stock', authenticate, dashboardController.getAlertasStock)
router.get('/movimientos-por-dia', authenticate, dashboardController.getMovimientosPorDia)

export default router
