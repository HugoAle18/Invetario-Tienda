import { body, param } from 'express-validator'

export const crearRules = [
  body('nombre')
    .notEmpty().withMessage('El nombre es requerido')
    .trim(),
  body('contacto').optional().trim(),
  body('telefono').optional().trim(),
  body('email').optional().isEmail().withMessage('Email inválido').normalizeEmail(),
  body('direccion').optional().trim(),
]

export const actualizarRules = [
  param('id').isUUID().withMessage('ID inválido'),
  ...crearRules,
]

export const idRule = [
  param('id').isUUID().withMessage('ID inválido'),
]
