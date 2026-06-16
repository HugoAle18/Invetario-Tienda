import { body, param } from 'express-validator'

export const crearRules = [
  body('nombre')
    .notEmpty().withMessage('El nombre es requerido')
    .trim(),
  body('email')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('rol')
    .isIn(['administrador', 'empleado']).withMessage('Rol inválido'),
]

export const actualizarRules = [
  param('id').isUUID().withMessage('ID inválido'),
  body('nombre')
    .notEmpty().withMessage('El nombre es requerido')
    .trim(),
  body('email')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .optional({ values: 'falsy' })
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('rol')
    .isIn(['administrador', 'empleado']).withMessage('Rol inválido'),
]

export const idRule = [
  param('id').isUUID().withMessage('ID inválido'),
]
