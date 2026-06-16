import * as configModel from '../models/configModel.js'

export async function getPerfil(req, res) {
  try {
    const data = await configModel.obtenerPerfil(req.user.id)
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener perfil' })
  }
}

export async function updatePerfil(req, res) {
  try {
    const data = await configModel.actualizarPerfil(req.user.id, req.body)
    res.json(data)
  } catch (error) {
    if (error.code === '23505') return res.status(400).json({ error: 'El email ya está en uso' })
    res.status(500).json({ error: 'Error al actualizar perfil' })
  }
}

export async function updatePassword(req, res) {
  try {
    await configModel.cambiarPassword(req.user.id, req.body.password_actual, req.body.password_nueva)
    res.json({ mensaje: 'Contraseña actualizada correctamente' })
  } catch (error) {
    const msg = error.message || 'Error al cambiar contraseña'
    res.status(400).json({ error: msg })
  }
}
