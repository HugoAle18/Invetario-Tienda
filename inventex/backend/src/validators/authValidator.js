import { body } from 'express-validator'

export const loginRules = [
  body('email')
    .isEmail().withMessage('Correo electrónico inválido')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida'),
]

export const refreshRules = [
  body('refreshToken')
    .notEmpty().withMessage('Refresh token requerido'),
]
