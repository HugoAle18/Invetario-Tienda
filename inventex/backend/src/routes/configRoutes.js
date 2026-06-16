import { Router } from 'express'
import { authenticate } from '../middlewares/authMiddleware.js'
import { handleValidation } from '../middlewares/validationMiddleware.js'
import { body } from 'express-validator'
import * as configController from '../controllers/configController.js'

const router = Router()

const perfilRules = [
  body('nombre').notEmpty().withMessage('El nombre es requerido').trim(),
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
]

const passwordRules = [
  body('password_actual').notEmpty().withMessage('La contraseña actual es requerida'),
  body('password_nueva').isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres'),
]

router.get('/perfil', authenticate, configController.getPerfil)
router.put('/perfil', authenticate, perfilRules, handleValidation, configController.updatePerfil)
router.put('/password', authenticate, passwordRules, handleValidation, configController.updatePassword)

export default router
