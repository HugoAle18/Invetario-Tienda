import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import supabase from '../config/supabase.js'

function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, rol: user.rol, nombre: user.nombre },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  )
}

async function generateRefreshToken(userId) {
  const token = crypto.randomBytes(40).toString('hex')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const { error } = await supabase
    .from('refresh_tokens')
    .insert({ usuario_id: userId, token, expires_at: expiresAt })

  if (error) throw error
  return token
}

export async function login(req, res) {
  const { email, password } = req.body

  const { data: user, error } = await supabase
    .from('usuarios')
    .select('id, nombre, email, password, rol, activo')
    .eq('email', email)
    .single()

  if (error || !user || !user.activo) {
    return res.status(401).json({ error: 'Credenciales inválidas' })
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    return res.status(401).json({ error: 'Credenciales inválidas' })
  }

  const accessToken = generateAccessToken(user)
  const refreshToken = await generateRefreshToken(user.id)

  res.json({
    accessToken,
    refreshToken,
    user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol },
  })
}

export async function refresh(req, res) {
  const { refreshToken } = req.body

  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token requerido' })
  }

  const { data: tokenData, error } = await supabase
    .from('refresh_tokens')
    .select('id, usuario_id, expires_at')
    .eq('token', refreshToken)
    .single()

  if (error || !tokenData || new Date(tokenData.expires_at) < new Date()) {
    return res.status(401).json({ error: 'Refresh token inválido o expirado' })
  }

  await supabase.from('refresh_tokens').delete().eq('id', tokenData.id)

  const { data: user } = await supabase
    .from('usuarios')
    .select('id, nombre, email, rol, activo')
    .eq('id', tokenData.usuario_id)
    .single()

  if (!user || !user.activo) {
    return res.status(401).json({ error: 'Usuario no encontrado o inactivo' })
  }

  const accessToken = generateAccessToken(user)
  const newRefreshToken = await generateRefreshToken(user.id)

  res.json({ accessToken, refreshToken: newRefreshToken, user })
}

export async function logout(req, res) {
  const { refreshToken } = req.body
  if (refreshToken) {
    await supabase.from('refresh_tokens').delete().eq('token', refreshToken)
  }
  res.json({ mensaje: 'Sesión cerrada' })
}

export async function me(req, res) {
  const { data: user, error } = await supabase
    .from('usuarios')
    .select('id, nombre, email, rol, created_at')
    .eq('id', req.user.id)
    .single()

  if (error) {
    return res.status(404).json({ error: 'Usuario no encontrado' })
  }

  res.json({ user })
}
