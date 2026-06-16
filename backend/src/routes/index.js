import { Router } from 'express'
import authRoutes from './authRoutes.js'
import dashboardRoutes from './dashboardRoutes.js'
import productoRoutes from './productoRoutes.js'
import categoriaRoutes from './categoriaRoutes.js'
import proveedorRoutes from './proveedorRoutes.js'
import movimientoRoutes from './movimientoRoutes.js'
import usuarioRoutes from './usuarioRoutes.js'
import reporteRoutes from './reporteRoutes.js'
import configRoutes from './configRoutes.js'
import empleadoRoutes from './empleadoRoutes.js'
import notificacionRoutes from './notificacionRoutes.js'
import aiRoutes from './aiRoutes.js'

const router = Router()

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

router.use('/auth', authRoutes)
router.use('/dashboard', dashboardRoutes)
router.use('/reportes', reporteRoutes)
router.use('/config', configRoutes)
router.use('/empleado', empleadoRoutes)
router.use('/productos', productoRoutes)
router.use('/categorias', categoriaRoutes)
router.use('/proveedores', proveedorRoutes)
router.use('/movimientos', movimientoRoutes)
router.use('/notificaciones', notificacionRoutes)
router.use('/usuarios', usuarioRoutes)
router.use('/ai', aiRoutes)

export default router
