import { Router } from 'express'
import { login, refresh, logout, me } from '../controllers/authController.js'
import { authenticate } from '../middlewares/authMiddleware.js'
import { loginRules, refreshRules } from '../validators/authValidator.js'
import { handleValidation } from '../middlewares/validationMiddleware.js'

const router = Router()

router.post('/login', loginRules, handleValidation, login)
router.post('/refresh', refreshRules, handleValidation, refresh)
router.post('/logout', logout)
router.get('/me', authenticate, me)

export default router
