import supabase from '../config/supabase.js'

export async function listar({ page = 1, limit = 20, tipo, producto_id, usuario_id, fecha_desde, fecha_hasta }) {
  let query = supabase
    .from('movimientos')
    .select(`
      id, tipo, cantidad, motivo, precio_unitario, created_at,
      producto_id, usuario_id,
      productos!producto_id (nombre, codigo),
      usuarios!usuario_id (nombre)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })

  if (tipo) query = query.eq('tipo', tipo)
  if (producto_id) query = query.eq('producto_id', producto_id)
  if (usuario_id) query = query.eq('usuario_id', usuario_id)
  if (fecha_desde) query = query.gte('created_at', fecha_desde)
  if (fecha_hasta) query = query.lte('created_at', fecha_hasta)

  const from = (page - 1) * limit
  const to = from + limit - 1
  query = query.range(from, to)

  const { data, error, count } = await query
  if (error) throw error

  return { data, total: count, page, limit }
}

export async function registrarEntrada(producto_id, cantidad, motivo, precio_unitario, usuario_id) {
  const { data, error } = await supabase.rpc('registrar_entrada', {
    p_producto_id: producto_id,
    p_cantidad: cantidad,
    p_motivo: motivo,
    p_precio_unitario: precio_unitario || 0,
    p_usuario_id: usuario_id,
  })

  if (error) throw error
  return data
}

export async function registrarSalida(producto_id, cantidad, motivo, usuario_id) {
  const { data, error } = await supabase.rpc('registrar_salida', {
    p_producto_id: producto_id,
    p_cantidad: cantidad,
    p_motivo: motivo,
    p_usuario_id: usuario_id,
  })

  if (error) throw error
  return data
}
