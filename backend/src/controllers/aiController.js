import { consultarAgente } from '../services/aiService.js'

export async function consultar(req, res) {
  try {
    const { mensaje } = req.body

    if (!mensaje || typeof mensaje !== 'string' || mensaje.trim().length === 0) {
      return res.status(400).json({ error: 'El mensaje es requerido' })
    }

    const respuesta = await consultarAgente(mensaje.trim(), req.user.rol)

    res.json({ respuesta })
  } catch (error) {
    console.error('[AiController] Error:', error)
    res.status(500).json({ error: 'Error al procesar la consulta' })
  }
}
