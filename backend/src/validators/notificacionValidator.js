import { param } from 'express-validator'

export const idRule = [
  param('id').isUUID().withMessage('ID de notificación inválido'),
]
