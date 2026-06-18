import supabase from '../config/supabase.js'

const PALABRAS_IGNORAR = [
  'cuanto', 'cuantas', 'cuantos', 'cuanta',
  'stock', 'tiene', 'el', 'la', 'los', 'las', 'de',
  'producto', 'informacion', 'sobre', 'dime',
  'busca', 'cual', 'es', 'del', 'hay',
  'cuando', 'se', 'agota', 'acaba',
  'comprar', 'mas', 'un', 'una', 'en',
  'para', 'con', 'por', 'que', 'su', 'sus',
  'unidades',
]

export function limpiarTextoParaBusqueda(mensaje) {
  const normalizado = mensaje
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  const resultado = normalizado
    .split(/\s+/)
    .filter((p) => p.length > 0 && !PALABRAS_IGNORAR.includes(p))
    .join(' ')
    .trim()

  return resultado
}

function escaparILIKE(texto) {
  return texto.replace(/%/g, '\\%').replace(/_/g, '\\_')
}

function extraerNombre(relacion) {
  if (!relacion) return null
  if (Array.isArray(relacion)) return relacion[0]?.nombre || null
  return relacion.nombre || null
}

export async function buscarProductoEnTexto(mensaje) {
  try {
    const textoLimpio = limpiarTextoParaBusqueda(mensaje)

    if (!textoLimpio || textoLimpio.length < 2) return null

    const textoEscapado = escaparILIKE(textoLimpio)

    const { data, error } = await supabase
      .from('productos')
      .select('*, categorias!categoria_id(nombre), proveedores!proveedor_id(nombre)')
      .or(`nombre.ilike.%${textoEscapado}%,codigo.ilike.%${textoEscapado}%`)
      .eq('activo', true)
      .limit(3)

    if (error) {
      console.error('Error en buscarProductoEnTexto:', error)
      throw error
    }

    return data && data.length > 0 ? data : null
  } catch (err) {
    console.error('Excepcion en buscarProductoEnTexto:', err)
    throw err
  }
}

export async function buscarCategoriaEnTexto(mensaje) {
  try {
    const textoLimpio = limpiarTextoParaBusqueda(mensaje)
    if (!textoLimpio || textoLimpio.length < 2) return null

    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .ilike('nombre', `%${textoLimpio}%`)
      .limit(1)

    if (error) throw error
    return data?.[0] || null
  } catch (err) {
    console.error('Excepcion en buscarCategoriaEnTexto:', err)
    throw err
  }
}

export async function buscarProveedorEnTexto(mensaje) {
  try {
    const textoLimpio = limpiarTextoParaBusqueda(mensaje)
    if (!textoLimpio || textoLimpio.length < 2) return null

    const { data, error } = await supabase
      .from('proveedores')
      .select('*')
      .ilike('nombre', `%${textoLimpio}%`)
      .limit(1)

    if (error) throw error
    return data?.[0] || null
  } catch (err) {
    console.error('Excepcion en buscarProveedorEnTexto:', err)
    throw err
  }
}

export { extraerNombre }
