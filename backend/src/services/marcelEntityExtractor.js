import supabase from '../config/supabase.js'

const PALABRAS_IGNORAR = [
  'cuanto', 'cuantas', 'cuantos', 'stock', 'tiene',
  'el', 'la', 'los', 'las', 'de', 'producto',
  'informacion', 'informacion', 'sobre', 'dime',
  'busca', 'cual', 'cual', 'es', 'del', 'hay',
  'cuando', 'cuando', 'se', 'agota', 'acaba',
  'comprar', 'mas', 'mas', 'un', 'una', 'en',
  'para', 'con', 'por', 'que', 'su', 'sus',
]

export function limpiarTextoParaBusqueda(mensaje) {
  return mensaje
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/\s+/)
    .filter((p) => p.length > 0 && !PALABRAS_IGNORAR.includes(p))
    .join(' ')
    .trim()
}

export async function buscarProductoEnTexto(mensaje) {
  const textoLimpio = limpiarTextoParaBusqueda(mensaje)
  if (textoLimpio.length < 2) return null

  const { data, error } = await supabase
    .from('productos')
    .select('*, categorias!categoria_id(nombre), proveedores!proveedor_id(nombre)')
    .or(`nombre.ilike.%${textoLimpio}%,codigo.ilike.%${textoLimpio}%`)
    .eq('activo', true)
    .limit(3)

  if (error || !data || data.length === 0) return null
  return data
}

export async function buscarCategoriaEnTexto(mensaje) {
  const textoLimpio = limpiarTextoParaBusqueda(mensaje)
  if (textoLimpio.length < 2) return null

  const { data } = await supabase
    .from('categorias')
    .select('*')
    .ilike('nombre', `%${textoLimpio}%`)
    .limit(1)

  return data?.[0] || null
}

export async function buscarProveedorEnTexto(mensaje) {
  const textoLimpio = limpiarTextoParaBusqueda(mensaje)
  if (textoLimpio.length < 2) return null

  const { data } = await supabase
    .from('proveedores')
    .select('*')
    .ilike('nombre', `%${textoLimpio}%`)
    .limit(1)

  return data?.[0] || null
}
