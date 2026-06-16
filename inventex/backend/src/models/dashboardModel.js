import supabase from '../config/supabase.js'

export async function getDashboardAdmin() {
  const [
    { count: total_productos },
    { count: total_categorias },
    { count: total_proveedores },
    { count: total_movimientos_30d },
    { count: total_usuarios },
    { data: valor_data },
    { data: bajo_stock_data },
  ] = await Promise.all([
    supabase.from('productos').select('*', { count: 'exact', head: true }).eq('activo', true),
    supabase.from('categorias').select('*', { count: 'exact', head: true }),
    supabase.from('proveedores').select('*', { count: 'exact', head: true }),
    supabase.from('movimientos').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString()),
    supabase.from('usuarios').select('*', { count: 'exact', head: true }).eq('activo', true),
    supabase.from('productos').select('precio_compra, stock_actual').eq('activo', true),
    supabase.from('productos').select('id, stock_actual, stock_minimo').eq('activo', true),
  ])

  let valor_inventario = 0
  if (valor_data) {
    valor_inventario = valor_data.reduce((s, p) => s + (Number(p.precio_compra) || 0) * (p.stock_actual || 0), 0)
  }

  const productos_bajo_stock = (bajo_stock_data || []).filter((p) => p.stock_actual <= p.stock_minimo).length

  return {
    total_productos: total_productos || 0,
    total_categorias: total_categorias || 0,
    total_proveedores: total_proveedores || 0,
    total_movimientos_30d: total_movimientos_30d || 0,
    total_usuarios: total_usuarios || 0,
    valor_inventario,
    productos_bajo_stock,
  }
}

export async function getMovimientosRecientes(limite = 20) {
  const { data, error } = await supabase
    .from('movimientos')
    .select(`
      id, tipo, cantidad, motivo, created_at,
      productos!producto_id (nombre),
      usuarios!usuario_id (nombre)
    `)
    .order('created_at', { ascending: false })
    .limit(limite)

  if (error) throw error

  return (data || []).map((m) => ({
    id: m.id,
    tipo: m.tipo,
    cantidad: m.cantidad,
    motivo: m.motivo,
    producto: m.productos?.nombre || '',
    usuario: m.usuarios?.nombre || '',
    created_at: m.created_at,
  }))
}

export async function getAlertasStock() {
  const { data, error } = await supabase
    .from('productos')
    .select('id, codigo, nombre, stock_actual, stock_minimo')
    .eq('activo', true)

  if (error) throw error

  return (data || [])
    .filter((p) => p.stock_actual <= p.stock_minimo)
    .map((p) => ({
      ...p,
      diferencia: p.stock_actual - p.stock_minimo,
    }))
    .sort((a, b) => a.diferencia - b.diferencia)
}

export async function getMovimientosPorDia(dias = 30) {
  const { data, error } = await supabase
    .from('movimientos')
    .select('tipo, created_at')
    .gte('created_at', new Date(Date.now() - dias * 86400000).toISOString())
    .order('created_at', { ascending: true })

  if (error) throw error

  const grouped = {}
  for (const row of data || []) {
    const key = row.created_at?.split('T')[0]
    if (!key) continue
    if (!grouped[key]) grouped[key] = { fecha: key, entrada: 0, salida: 0 }
    grouped[key][row.tipo]++
  }

  return Object.values(grouped)
}
