import bcrypt from 'bcryptjs'
import supabase from '../config/supabase.js'

export async function obtenerPerfil(id) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nombre, email, rol, created_at')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function actualizarPerfil(id, { nombre, email }) {
  const { data, error } = await supabase
    .from('usuarios')
    .update({ nombre, email })
    .eq('id', id)
    .select('id, nombre, email, rol, created_at')
    .single()

  if (error) throw error
  return data
}

export async function cambiarPassword(id, passwordActual, passwordNueva) {
  const { data: user, error: fetchError } = await supabase
    .from('usuarios')
    .select('password')
    .eq('id', id)
    .single()

  if (fetchError || !user) throw new Error('Usuario no encontrado')

  const valid = bcrypt.compareSync(passwordActual, user.password)
  if (!valid) throw new Error('Contraseña actual incorrecta')

  const hash = bcrypt.hashSync(passwordNueva, 10)
  const { error: updateError } = await supabase
    .from('usuarios')
    .update({ password: hash })
    .eq('id', id)

  if (updateError) throw updateError
}
