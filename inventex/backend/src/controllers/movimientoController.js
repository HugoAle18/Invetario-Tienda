import * as movimientoModel from '../models/movimientoModel.js'

export async function listar(req, res) {
  try {
    const { page = 1, limit = 20, tipo, producto_id, fecha_desde, fecha_hasta } = req.query

    const params = {
      page: parseInt(page),
      limit: parseInt(limit),
      tipo,
      producto_id,
      fecha_desde,
      fecha_hasta,
    }

    if (req.user.rol === 'empleado') {
      params.usuario_id = req.user.id
    }

    const result = await movimientoModel.listar(params)

    // Empleado no ve precios
    if (req.user.rol === 'empleado' && result.data) {
      result.data = result.data.map(({ precio_unitario, ...rest }) => rest)
    }

    res.json(result)
  } catch (error) {
    res.status(500).json({ error: 'Error al listar movimientos' })
  }
}

export async function registrarEntrada(req, res) {
  try {
    const result = await movimientoModel.registrarEntrada(
      req.body.producto_id,
      req.body.cantidad,
      req.body.motivo,
      req.body.precio_unitario,
      req.user.id
    )

    if (!result.exito) {
      return res.status(400).json({ error: result.error })
    }

    res.status(201).json(result)
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar entrada' })
  }
}

export async function registrarSalida(req, res) {
  try {
    const result = await movimientoModel.registrarSalida(
      req.body.producto_id,
      req.body.cantidad,
      req.body.motivo,
      req.user.id
    )

    if (!result.exito) {
      return res.status(400).json({ error: result.error })
    }

    res.status(201).json(result)
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar salida' })
  }
}
