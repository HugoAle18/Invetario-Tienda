import supabase from '../config/supabase.js'

export async function getPanelData(usuarioId) {
  const { count: totalProductos } = await supabase
    .from('productos')
    .select('id', { count: 'exact', head: true })
    .eq('activo', true)

  const { data: alertas } = await supabase.rpc('obtener_alertas_stock')
  const { count: misMovimientos } = await supabase
    .from('movimientos')
    .select('id', { count: 'exact', head: true })
    .eq('usuario_id', usuarioId)
  const { count: movimientosHoy } = await supabase
    .from('movimientos')
    .select('id', { count: 'exact', head: true })
    .eq('usuario_id', usuarioId)
    .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())

  const { data: movimientosRecientes } = await supabase.rpc('obtener_movimientos_recientes', { p_limite: 5 })

  // Strip precio_unitario for safety
  const safeMovements = (movimientosRecientes || []).map((m) => {
    const { precio_unitario, ...rest } = m
    return rest
  })

  return {
    total_productos: totalProductos || 0,
    alertas_stock: alertas?.length || 0,
    mis_movimientos: misMovimientos || 0,
    movimientos_hoy: movimientosHoy || 0,
    movimientos_recientes: safeMovements,
  }
}
