import * as proveedorModel from '../models/proveedorModel.js'

export async function listar(req, res) {
  try {
    const data = await proveedorModel.listar()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Error al listar proveedores' })
  }
}

export async function obtener(req, res) {
  try {
    const data = await proveedorModel.obtenerPorId(req.params.id)
    if (!data) return res.status(404).json({ error: 'Proveedor no encontrado' })
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener proveedor' })
  }
}

export async function crear(req, res) {
  try {
    const proveedor = await proveedorModel.crear(req.body)
    res.status(201).json(proveedor)
  } catch (error) {
    res.status(500).json({ error: 'Error al crear proveedor' })
  }
}

export async function actualizar(req, res) {
  try {
    const proveedor = await proveedorModel.actualizar(req.params.id, req.body)
    res.json(proveedor)
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar proveedor' })
  }
}

export async function eliminar(req, res) {
  try {
    await proveedorModel.eliminar(req.params.id)
    res.json({ mensaje: 'Proveedor eliminado' })
  } catch (error) {
    if (error.code === '23503') return res.status(400).json({ error: 'Proveedor en uso por productos' })
    res.status(500).json({ error: 'Error al eliminar proveedor' })
  }
}
