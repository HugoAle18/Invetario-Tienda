import * as empleadoModel from '../models/empleadoModel.js'

export async function getPanel(req, res) {
  try {
    const data = await empleadoModel.getPanelData(req.user.id)
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Error al cargar panel' })
  }
}
