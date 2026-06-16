import { Router } from 'express'
import { authenticate } from '../middlewares/authMiddleware.js'
import { body } from 'express-validator'
import { handleValidation } from '../middlewares/validationMiddleware.js'
import { consultar } from '../controllers/aiController.js'

const router = Router()

const consultarRules = [
  body('mensaje').notEmpty().withMessage('El mensaje es requerido').trim(),
]

router.post('/consultar', authenticate, consultarRules, handleValidation, consultar)

export default router
