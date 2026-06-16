import supabase from '../config/supabase.js'

export async function listar() {
  const { data, error } = await supabase
    .from('proveedores')
    .select('*')
    .order('nombre', { ascending: true })

  if (error) throw error
  return data
}

export async function obtenerPorId(id) {
  const { data, error } = await supabase
    .from('proveedores')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function crear(data) {
  const { data: proveedor, error } = await supabase
    .from('proveedores')
    .insert({
      nombre: data.nombre,
      contacto: data.contacto || '',
      telefono: data.telefono || '',
      email: data.email || '',
      direccion: data.direccion || '',
    })
    .select()
    .single()

  if (error) throw error
  return proveedor
}

export async function actualizar(id, data) {
  const { data: proveedor, error } = await supabase
    .from('proveedores')
    .update({
      nombre: data.nombre,
      contacto: data.contacto || '',
      telefono: data.telefono || '',
      email: data.email || '',
      direccion: data.direccion || '',
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return proveedor
}

export async function eliminar(id) {
  const { error } = await supabase
    .from('proveedores')
    .delete()
    .eq('id', id)

  if (error) throw error
}
