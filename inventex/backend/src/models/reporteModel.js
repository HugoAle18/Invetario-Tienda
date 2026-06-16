import supabase from '../config/supabase.js'

export async function productosPorCategoria() {
  const { data, error } = await supabase
    .from('categorias')
    .select(`
      id, nombre,
      productos!categoria_id (id)
    `)
    .order('nombre', { ascending: true })

  if (error) throw error

  return (data || []).map((cat) => ({
    nombre: cat.nombre,
    total: (cat.productos || []).filter((p) => p.id).length,
  })).filter((c) => c.total > 0)
}

export async function movimientosPorPeriodo(desde, hasta) {
  const { data, error } = await supabase
    .from('movimientos')
    .select('tipo, created_at')
    .gte('created_at', desde)
    .lte('created_at', hasta)
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

export async function productosMasMovidos(limite = 10) {
  const { data, error } = await supabase
    .from('movimientos')
    .select(`
      cantidad,
      productos!producto_id (nombre, codigo)
    `)

  if (error) throw error

  const grouped = {}
  for (const row of data || []) {
    const key = row.productos?.nombre || 'Desconocido'
    if (!grouped[key]) {
      grouped[key] = {
        nombre: key,
        codigo: row.productos?.codigo || '',
        total_movimientos: 0,
        total_cantidad: 0,
      }
    }
    grouped[key].total_movimientos++
    grouped[key].total_cantidad += row.cantidad
  }

  return Object.values(grouped)
    .sort((a, b) => b.total_movimientos - a.total_movimientos)
    .slice(0, limite)
}

export async function valorInventarioPorCategoria() {
  const { data, error } = await supabase
    .from('categorias')
    .select(`
      id, nombre,
      productos!categoria_id (stock_actual, precio_compra, precio_venta, activo)
    `)
    .order('nombre', { ascending: true })

  if (error) throw error

  return (data || []).map((cat) => {
    const activos = (cat.productos || []).filter((p) => p.activo)
    return {
      nombre: cat.nombre,
      productos: activos.length,
      total_stock: activos.reduce((s, p) => s + (p.stock_actual || 0), 0),
      valor_compra: activos.reduce((s, p) => s + (Number(p.precio_compra) || 0) * (p.stock_actual || 0), 0),
      valor_venta: activos.reduce((s, p) => s + (Number(p.precio_venta) || 0) * (p.stock_actual || 0), 0),
    }
  }).filter((c) => c.productos > 0)
}
