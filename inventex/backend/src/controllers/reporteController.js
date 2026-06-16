import * as reporteModel from '../models/reporteModel.js'

export async function getProductosPorCategoria(req, res) {
  try {
    const data = await reporteModel.productosPorCategoria()
    res.json(data)
  } catch (error) {
    console.error('[REPORTE] getProductosPorCategoria error:', error.message || error)
    res.status(500).json({ error: 'Error al obtener productos por categoría' })
  }
}

export async function getMovimientosPorPeriodo(req, res) {
  try {
    const hasta = req.query.hasta || new Date().toISOString()
    const desde = req.query.desde || new Date(Date.now() - 30 * 86400000).toISOString()
    const data = await reporteModel.movimientosPorPeriodo(desde, hasta)
    res.json(data)
  } catch (error) {
    console.error('[REPORTE] getMovimientosPorPeriodo error:', error.message || error)
    res.status(500).json({ error: 'Error al obtener movimientos por período' })
  }
}

export async function getProductosMasMovidos(req, res) {
  try {
    const limite = parseInt(req.query.limite) || 10
    const data = await reporteModel.productosMasMovidos(limite)
    res.json(data)
  } catch (error) {
    console.error('[REPORTE] getProductosMasMovidos error:', error.message || error)
    res.status(500).json({ error: 'Error al obtener productos más movidos' })
  }
}

export async function getValorInventario(req, res) {
  try {
    const data = await reporteModel.valorInventarioPorCategoria()
    res.json(data)
  } catch (error) {
    console.error('[REPORTE] getValorInventario error:', error.message || error)
    res.status(500).json({ error: 'Error al obtener valor de inventario' })
  }
}
