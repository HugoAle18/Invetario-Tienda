import { body, param } from 'express-validator'

export const crearRules = [
  body('nombre')
    .notEmpty().withMessage('El nombre es requerido')
    .trim(),
  body('descripcion')
    .optional().trim(),
]

export const actualizarRules = [
  param('id').isUUID().withMessage('ID inválido'),
  ...crearRules,
]

export const idRule = [
  param('id').isUUID().withMessage('ID inválido'),
]
