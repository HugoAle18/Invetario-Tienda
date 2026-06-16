import supabase from '../config/supabase.js'

export async function listar({ page = 1, limit = 20, search, categoria_id }) {
  let query = supabase
    .from('productos')
    .select(`
      id, codigo, nombre, descripcion, precio_compra, precio_venta,
      stock_minimo, stock_actual, imagen_url, activo, created_at, updated_at,
      categoria_id, proveedor_id,
      categorias!categoria_id (nombre),
      proveedores!proveedor_id (nombre)
    `, { count: 'exact' })
    .eq('activo', true)
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`nombre.ilike.%${search}%,codigo.ilike.%${search}%`)
  }

  if (categoria_id) {
    query = query.eq('categoria_id', categoria_id)
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
    .from('productos')
    .select(`
      id, codigo, nombre, descripcion, precio_compra, precio_venta,
      stock_minimo, stock_actual, imagen_url, activo,
      categoria_id, proveedor_id,
      categorias!categoria_id (nombre),
      proveedores!proveedor_id (nombre)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function crear(data) {
  const { data: producto, error } = await supabase
    .from('productos')
    .insert({
      codigo: data.codigo,
      nombre: data.nombre,
      descripcion: data.descripcion || '',
      categoria_id: data.categoria_id || null,
      proveedor_id: data.proveedor_id || null,
      precio_compra: data.precio_compra,
      precio_venta: data.precio_venta,
      stock_minimo: data.stock_minimo,
      stock_actual: data.stock_actual,
      imagen_url: data.imagen_url || '',
    })
    .select()
    .single()

  if (error) throw error
  return producto
}

export async function actualizar(id, data) {
  const { data: producto, error } = await supabase
    .from('productos')
    .update({
      codigo: data.codigo,
      nombre: data.nombre,
      descripcion: data.descripcion,
      categoria_id: data.categoria_id || null,
      proveedor_id: data.proveedor_id || null,
      precio_compra: data.precio_compra,
      precio_venta: data.precio_venta,
      stock_minimo: data.stock_minimo,
      stock_actual: data.stock_actual,
      imagen_url: data.imagen_url || '',
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return producto
}

export async function eliminar(id) {
  const { error } = await supabase
    .from('productos')
    .update({ activo: false })
    .eq('id', id)

  if (error) throw error
}
