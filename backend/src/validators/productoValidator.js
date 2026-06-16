import { body, param } from 'express-validator'

export const crearRules = [
  body('codigo')
    .notEmpty().withMessage('El código es requerido')
    .trim(),
  body('nombre')
    .notEmpty().withMessage('El nombre es requerido')
    .trim(),
  body('precio_compra')
    .isFloat({ min: 0 }).withMessage('Precio de compra inválido'),
  body('precio_venta')
    .isFloat({ min: 0 }).withMessage('Precio de venta inválido'),
  body('stock_minimo')
    .isInt({ min: 0 }).withMessage('Stock mínimo inválido'),
  body('stock_actual')
    .isInt({ min: 0 }).withMessage('Stock actual inválido'),
  body('categoria_id')
    .optional({ values: 'falsy' }).isUUID().withMessage('Categoría inválida'),
  body('proveedor_id')
    .optional({ values: 'falsy' }).isUUID().withMessage('Proveedor inválido'),
]

export const actualizarRules = [
  param('id').isUUID().withMessage('ID inválido'),
  ...crearRules,
]

export const idRule = [
  param('id').isUUID().withMessage('ID inválido'),
]
