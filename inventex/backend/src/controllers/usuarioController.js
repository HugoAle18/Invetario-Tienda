import * as usuarioModel from '../models/usuarioModel.js'

export async function listar(req, res) {
  try {
    const { page = 1, limit = 20, search } = req.query
    const result = await usuarioModel.listar({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
    })
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: 'Error al listar usuarios' })
  }
}

export async function obtener(req, res) {
  try {
    const data = await usuarioModel.obtenerPorId(req.params.id)
    if (!data) return res.status(404).json({ error: 'Usuario no encontrado' })
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuario' })
  }
}

export async function crear(req, res) {
  try {
    const usuario = await usuarioModel.crear(req.body)
    res.status(201).json(usuario)
  } catch (error) {
    if (error.code === '23505') return res.status(400).json({ error: 'El email ya está registrado' })
    res.status(500).json({ error: 'Error al crear usuario' })
  }
}

export async function actualizar(req, res) {
  try {
    const usuario = await usuarioModel.actualizar(req.params.id, req.body)
    res.json(usuario)
  } catch (error) {
    if (error.code === '23505') return res.status(400).json({ error: 'El email ya está registrado' })
    res.status(500).json({ error: 'Error al actualizar usuario' })
  }
}

export async function toggleActivo(req, res) {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'No puedes desactivar tu propia cuenta' })
    }
    const usuario = await usuarioModel.toggleActivo(req.params.id)
    res.json(usuario)
  } catch (error) {
    res.status(500).json({ error: 'Error al cambiar estado del usuario' })
  }
}
