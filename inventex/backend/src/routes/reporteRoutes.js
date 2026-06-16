import { Router } from 'express'
import { authenticate, authorize } from '../middlewares/authMiddleware.js'
import * as reporteController from '../controllers/reporteController.js'

const router = Router()

router.get('/productos-por-categoria', authenticate, authorize('administrador'), reporteController.getProductosPorCategoria)
router.get('/movimientos-por-periodo', authenticate, authorize('administrador'), reporteController.getMovimientosPorPeriodo)
router.get('/productos-mas-movidos', authenticate, authorize('administrador'), reporteController.getProductosMasMovidos)
router.get('/valor-inventario', authenticate, authorize('administrador'), reporteController.getValorInventario)

export default router
