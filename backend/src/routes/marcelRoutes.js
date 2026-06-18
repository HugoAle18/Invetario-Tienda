import { Router } from 'express'
import { authenticate } from '../middlewares/authMiddleware.js'
import { body } from 'express-validator'
import { handleValidation } from '../middlewares/validationMiddleware.js'
import { chatConMarcel } from '../controllers/marcelController.js'
import rateLimit from 'express-rate-limit'

const router = Router()

const marcelLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30,
  keyGenerator: (req) => req.usuario?.id || req.ip,
  message: { error: 'Has excedido el limite de mensajes. Intenta de nuevo en 5 minutos.' },
  skip: (req) => req.method !== 'POST',
  validate: false,
})

const chatRules = [
  body('mensaje')
    .notEmpty().withMessage('El mensaje es requerido')
    .isString().withMessage('El mensaje debe ser texto')
    .isLength({ max: 300 }).withMessage('El mensaje no puede exceder 300 caracteres')
    .trim(),
]

router.post('/chat', authenticate, marcelLimiter, chatRules, handleValidation, chatConMarcel)

export default router
