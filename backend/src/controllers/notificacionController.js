import * as notificacionModel from '../models/notificacionModel.js'

export async function listar(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query
    const result = await notificacionModel.listar({
      usuario_id: req.user.id,
      page: parseInt(page),
      limit: parseInt(limit),
    })
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: 'Error al listar notificaciones' })
  }
}

export async function obtenerNoLeidas(req, res) {
  try {
    const data = await notificacionModel.obtenerNoLeidas(req.user.id)
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener notificaciones no leídas' })
  }
}

export async function contarNoLeidas(req, res) {
  try {
    const count = await notificacionModel.contarNoLeidas(req.user.id)
    res.json({ count })
  } catch (error) {
    res.status(500).json({ error: 'Error al contar notificaciones' })
  }
}

export async function marcarLeida(req, res) {
  try {
    const data = await notificacionModel.marcarLeida(req.params.id, req.user.id)
    if (!data) return res.status(404).json({ error: 'Notificación no encontrada' })
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Error al marcar notificación' })
  }
}

export async function marcarTodasLeidas(req, res) {
  try {
    await notificacionModel.marcarTodasLeidas(req.user.id)
    res.json({ exito: true })
  } catch (error) {
    res.status(500).json({ error: 'Error al marcar notificaciones' })
  }
}
