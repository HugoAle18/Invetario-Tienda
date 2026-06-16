import supabase from '../config/supabase.js'

export async function listar({ usuario_id, page = 1, limit = 20 }) {
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await supabase
    .from('notificaciones')
    .select('*', { count: 'exact' })
    .eq('usuario_id', usuario_id)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw error
  return { data, total: count, page, limit }
}

export async function obtenerNoLeidas(usuario_id) {
  const { data, error } = await supabase
    .from('notificaciones')
    .select('*')
    .eq('usuario_id', usuario_id)
    .eq('leida', false)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return data
}

export async function contarNoLeidas(usuario_id) {
  const { count, error } = await supabase
    .from('notificaciones')
    .select('*', { count: 'exact', head: true })
    .eq('usuario_id', usuario_id)
    .eq('leida', false)

  if (error) throw error
  return count
}

export async function marcarLeida(id, usuario_id) {
  const { data, error } = await supabase
    .from('notificaciones')
    .update({ leida: true })
    .eq('id', id)
    .eq('usuario_id', usuario_id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function marcarTodasLeidas(usuario_id) {
  const { error } = await supabase
    .from('notificaciones')
    .update({ leida: true })
    .eq('usuario_id', usuario_id)
    .eq('leida', false)

  if (error) throw error
}

export async function crear({ usuario_id, tipo, titulo, mensaje, referencia_tipo, referencia_id }) {
  const { data, error } = await supabase
    .from('notificaciones')
    .insert({ usuario_id, tipo, titulo, mensaje, referencia_tipo, referencia_id })
    .select()
    .single()

  if (error) throw error
  return data
}
