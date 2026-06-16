import * as dashboardModel from '../models/dashboardModel.js'

export async function getAdmin(req, res) {
  try {
    const data = await dashboardModel.getDashboardAdmin()
    res.json(data)
  } catch (error) {
    console.error('[DASHBOARD] getAdmin error:', error.message || error)
    res.status(500).json({ error: 'Error al obtener datos del dashboard' })
  }
}

export async function getMovimientosRecientes(req, res) {
  try {
    const limite = parseInt(req.query.limite) || 20
    const data = await dashboardModel.getMovimientosRecientes(limite)
    res.json(data)
  } catch (error) {
    console.error('[DASHBOARD] getMovimientosRecientes error:', error.message || error)
    res.status(500).json({ error: 'Error al obtener movimientos recientes' })
  }
}

export async function getAlertasStock(req, res) {
  try {
    const data = await dashboardModel.getAlertasStock()
    res.json(data)
  } catch (error) {
    console.error('[DASHBOARD] getAlertasStock error:', error.message || error)
    res.status(500).json({ error: 'Error al obtener alertas de stock' })
  }
}

export async function getMovimientosPorDia(req, res) {
  try {
    const dias = parseInt(req.query.dias) || 30
    const data = await dashboardModel.getMovimientosPorDia(dias)
    res.json(data)
  } catch (error) {
    console.error('[DASHBOARD] getMovimientosPorDia error:', error.message || error)
    res.status(500).json({ error: 'Error al obtener movimientos por día' })
  }
}
