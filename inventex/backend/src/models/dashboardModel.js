import supabase from '../config/supabase.js'

export async function getDashboardAdmin() {
  const { data, error } = await supabase.rpc('obtener_dashboard_admin')
  if (error) throw error
  return data
}

export async function getMovimientosRecientes(limite = 20) {
  const { data, error } = await supabase.rpc('obtener_movimientos_recientes', { p_limite: limite })
  if (error) throw error
  return data
}

export async function getAlertasStock() {
  const { data, error } = await supabase.rpc('obtener_alertas_stock')
  if (error) throw error
  return data
}

export async function getMovimientosPorDia(dias = 30) {
  const { data, error } = await supabase
    .from('movimientos')
    .select("tipo, created_at::date as fecha, count(*)", { count: 'exact' })
    .gte('created_at', new Date(Date.now() - dias * 86400000).toISOString())
    .order('created_at', { ascending: true })

  if (error) throw error

  const grouped = {}
  for (const row of data) {
    const key = row.created_at?.split('T')[0]
    if (!key) continue
    if (!grouped[key]) grouped[key] = { fecha: key, entrada: 0, salida: 0 }
    grouped[key][row.tipo] = Number(row.count) || 0
  }

  return Object.values(grouped).slice(-dias)
}
