import supabase from '../config/supabase.js'

export async function listar() {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .order('nombre', { ascending: true })

  if (error) throw error
  return data
}

export async function obtenerPorId(id) {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function crear(data) {
  const { data: categoria, error } = await supabase
    .from('categorias')
    .insert({ nombre: data.nombre, descripcion: data.descripcion || '' })
    .select()
    .single()

  if (error) throw error
  return categoria
}

export async function actualizar(id, data) {
  const { data: categoria, error } = await supabase
    .from('categorias')
    .update({ nombre: data.nombre, descripcion: data.descripcion || '' })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return categoria
}

export async function eliminar(id) {
  const { error } = await supabase
    .from('categorias')
    .delete()
    .eq('id', id)

  if (error) throw error
}
