import * as productoModel from '../models/productoModel.js'

function aplanarCategoria(producto) {
  if (!producto) return producto
  return {
    ...producto,
    categoria: producto.categorias?.nombre || 'Sin categoría',
    stock: producto.stock_actual ?? producto.stock ?? 0,
  }
}

function sanitizarParaEmpleado(producto) {
  if (!producto) return producto
  if (Array.isArray(producto)) {
    return producto.map((p) => {
      const { precio_compra, ...rest } = aplanarCategoria(p)
      return rest
    })
  }
  const { precio_compra, ...rest } = aplanarCategoria(producto)
  return rest
}

export async function listar(req, res) {
  try {
    const { page = 1, limit = 20, search, categoria_id } = req.query
    const result = await productoModel.listar({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      categoria_id,
    })
    if (req.user.rol === 'empleado') {
      result.data = sanitizarParaEmpleado(result.data)
    } else {
      result.data = result.data.map(aplanarCategoria)
    }
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: 'Error al listar productos' })
  }
}

export async function obtener(req, res) {
  try {
    const data = await productoModel.obtenerPorId(req.params.id)
    if (!data) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }
    if (req.user.rol === 'empleado') {
      return res.json(sanitizarParaEmpleado(data))
    }
    res.json(aplanarCategoria(data))
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener producto' })
  }
}

export async function crear(req, res) {
  try {
    const producto = await productoModel.crear(req.body)
    res.status(201).json(aplanarCategoria(producto))
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'El código ya existe' })
    }
    res.status(500).json({ error: 'Error al crear producto' })
  }
}

export async function actualizar(req, res) {
  try {
    const producto = await productoModel.actualizar(req.params.id, req.body)
    res.json(aplanarCategoria(producto))
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'El código ya existe' })
    }
    res.status(500).json({ error: 'Error al actualizar producto' })
  }
}

export async function eliminar(req, res) {
  try {
    await productoModel.eliminar(req.params.id)
    res.json({ mensaje: 'Producto eliminado' })
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar producto' })
  }
}
