import * as categoriaModel from '../models/categoriaModel.js'

export async function listar(req, res) {
  try {
    const data = await categoriaModel.listar()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Error al listar categorías' })
  }
}

export async function obtener(req, res) {
  try {
    const data = await categoriaModel.obtenerPorId(req.params.id)
    if (!data) return res.status(404).json({ error: 'Categoría no encontrada' })
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener categoría' })
  }
}

export async function crear(req, res) {
  try {
    const categoria = await categoriaModel.crear(req.body)
    res.status(201).json(categoria)
  } catch (error) {
    if (error.code === '23505') return res.status(400).json({ error: 'El nombre ya existe' })
    res.status(500).json({ error: 'Error al crear categoría' })
  }
}

export async function actualizar(req, res) {
  try {
    const categoria = await categoriaModel.actualizar(req.params.id, req.body)
    res.json(categoria)
  } catch (error) {
    if (error.code === '23505') return res.status(400).json({ error: 'El nombre ya existe' })
    res.status(500).json({ error: 'Error al actualizar categoría' })
  }
}

export async function eliminar(req, res) {
  try {
    await categoriaModel.eliminar(req.params.id)
    res.json({ mensaje: 'Categoría eliminada' })
  } catch (error) {
    if (error.code === '23503') return res.status(400).json({ error: 'Categoría en uso por productos' })
    res.status(500).json({ error: 'Error al eliminar categoría' })
  }
}
