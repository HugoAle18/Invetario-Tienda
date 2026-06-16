import { param, body } from 'express-validator'

export const idRule = [
  param('id').isUUID().withMessage('ID de notificación inválido'),
]

export const crearRule = [
  body('usuario_id').isUUID().withMessage('usuario_id inválido'),
  body('tipo').isIn(['entrada', 'salida', 'alerta', 'sistema']).withMessage('Tipo inválido'),
  body('titulo').isString().notEmpty().withMessage('Titulo requerido'),
  body('mensaje').isString().notEmpty().withMessage('Mensaje requerido'),
  body('referencia_tipo').optional().isString(),
  body('referencia_id').optional().isUUID(),
]
