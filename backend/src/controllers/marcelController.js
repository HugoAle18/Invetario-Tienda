import { clasificarIntencion } from '../services/marcelIntentClassifier.js'
import * as handlers from '../services/marcelHandlers.js'

export const chatConMarcel = async (req, res) => {
  try {
    const { mensaje } = req.body
    const usuario = req.usuario

    if (!mensaje || mensaje.trim().length === 0) {
      return res.status(400).json({ error: 'El mensaje no puede estar vacio' })
    }

    const { intencion, handler, confianza } = clasificarIntencion(mensaje)

    let respuesta

    if (intencion === 'desconocida') {
      respuesta = await handlers.handleDesconocida(mensaje, usuario)
    } else {
      respuesta = await handlers[handler](mensaje, usuario)
    }

    res.json({ respuesta, intencion_detectada: intencion, confianza })
  } catch (error) {
    console.error('Error en MARCEL:', error)
    res.status(500).json({
      respuesta: 'Tuve un problema procesando tu consulta. Intenta reformularla.',
    })
  }
}
