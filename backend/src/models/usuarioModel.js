import bcrypt from 'bcryptjs'
import supabase from '../config/supabase.js'

export async function listar({ page = 1, limit = 20, search }) {
  let query = supabase
    .from('usuarios')
    .select('id, nombre, email, rol, activo, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`nombre.ilike.%${search}%,email.ilike.%${search}%`)
  }

  const from = (page - 1) * limit
  const to = from + limit - 1
  query = query.range(from, to)

  const { data, error, count } = await query
  if (error) throw error

  return { data, total: count, page, limit }
}

export async function obtenerPorId(id) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nombre, email, rol, activo, created_at')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function crear(data) {
  const password = bcrypt.hashSync(data.password, 10)

  const { data: usuario, error } = await supabase
    .from('usuarios')
    .insert({
      nombre: data.nombre,
      email: data.email,
      password,
      rol: data.rol,
      activo: true,
    })
    .select('id, nombre, email, rol, activo, created_at')
    .single()

  if (error) throw error
  return usuario
}

export async function actualizar(id, data) {
  const updates = {
    nombre: data.nombre,
    email: data.email,
    rol: data.rol,
  }

  if (data.password) {
    updates.password = bcrypt.hashSync(data.password, 10)
  }

  const { data: usuario, error } = await supabase
    .from('usuarios')
    .update(updates)
    .eq('id', id)
    .select('id, nombre, email, rol, activo, created_at')
    .single()

  if (error) throw error
  return usuario
}

export async function toggleActivo(id) {
  const { data: current } = await supabase
    .from('usuarios')
    .select('activo')
    .eq('id', id)
    .single()

  if (!current) throw new Error('Usuario no encontrado')

  const { data: usuario, error } = await supabase
    .from('usuarios')
    .update({ activo: !current.activo })
    .eq('id', id)
    .select('id, nombre, email, rol, activo, created_at')
    .single()

  if (error) throw error
  return usuario
}
