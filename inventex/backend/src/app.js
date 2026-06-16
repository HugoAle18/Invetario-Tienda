import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import routes from './routes/index.js'

const app = express()

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL,
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true)
    } else {
      callback(null, origin)
    }
  },
  credentials: true,
}))
app.use(helmet({ crossOriginResourcePolicy: false }))

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
}

app.set('trust proxy', 2)
app.use(express.json())

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  keyGenerator: (req) => req.body?.email || req.ip,
  message: { error: 'Demasiadas solicitudes. Intenta de nuevo en 15 minutos.' },
  skip: (req) => req.method !== 'POST',
  validate: false,
})

app.use('/api/v1/auth', authLimiter)
app.use('/api/v1', routes)

app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' })
})

export default app
