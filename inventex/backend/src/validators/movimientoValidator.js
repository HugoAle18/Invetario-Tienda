import { body } from 'express-validator'

export const entradaRules = [
  body('producto_id').isUUID().withMessage('Producto inválido'),
  body('cantidad').isInt({ min: 1 }).withMessage('La cantidad debe ser mayor a 0'),
  body('motivo').notEmpty().withMessage('El motivo es requerido').trim(),
  body('precio_unitario')
    .optional({ values: 'falsy' })
    .isFloat({ min: 0 }).withMessage('Precio unitario inválido'),
]

export const salidaRules = [
  body('producto_id').isUUID().withMessage('Producto inválido'),
  body('cantidad').isInt({ min: 1 }).withMessage('La cantidad debe ser mayor a 0'),
  body('motivo').notEmpty().withMessage('El motivo es requerido').trim(),
]
