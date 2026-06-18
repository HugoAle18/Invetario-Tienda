import supabase from '../config/supabase.js'
import {
  buscarProductoEnTexto,
  buscarCategoriaEnTexto,
  buscarProveedorEnTexto,
  extraerNombre,
} from './marcelEntityExtractor.js'

export async function handleStockCritico(_mensaje, _usuario) {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('id, codigo, nombre, stock_actual, stock_minimo, categoria_id')
      .eq('activo', true)

    if (error) throw error

    const criticos = (data || []).filter((p) => {
      const minimo = Number(p.stock_minimo) || 5
      return Number(p.stock_actual) <= minimo
    })

    if (criticos.length === 0) {
      return 'Buenas noticias. No tienes productos con stock critico en este momento. Todo tu inventario esta en niveles saludables.'
    }

    const ordenados = criticos.sort(
      (a, b) => (a.stock_minimo - a.stock_actual) - (b.stock_minimo - b.stock_actual)
    )

    let respuesta = `Encontre ${ordenados.length} producto${ordenados.length > 1 ? 's' : ''} que necesita${ordenados.length > 1 ? 'n' : ''} reposicion urgente:\n\n`

    ordenados.forEach((p) => {
      const diferencia = p.stock_minimo - p.stock_actual
      respuesta += `\u2022 ${p.nombre} (${p.codigo}): quedan ${p.stock_actual} unidades, minimo recomendado ${p.stock_minimo} [${diferencia} unidades por debajo]\n`
    })

    if (ordenados.length > 3) {
      const masCritico = ordenados[0]
      respuesta += `\nTe recomiendo priorizar la reposicion de ${masCritico.nombre}, que tiene el mayor deficit.`
    }

    return respuesta
  } catch (error) {
    console.error('Error en handleStockCritico:', error)
    return 'Tuve un problema al revisar los productos con stock critico. Intenta de nuevo.'
  }
}

export async function handleValorInventario(_mensaje, usuario) {
  try {
    if (usuario.rol === 'empleado') {
      return 'Lo siento, la informacion de valor financiero del inventario esta disponible solo para administradores.'
    }

    const { data, error } = await supabase
      .from('productos')
      .select('stock_actual, precio_compra, precio_venta')
      .eq('activo', true)

    if (error) throw error

    if (!data || data.length === 0) {
      return 'No hay productos activos en el inventario para calcular el valor.'
    }

    let valorCompra = 0
    let valorVenta = 0
    let totalUnidades = 0

    data.forEach((p) => {
      const unidades = Number(p.stock_actual) || 0
      totalUnidades += unidades
      valorCompra += unidades * (Number(p.precio_compra) || 0)
      valorVenta += unidades * (Number(p.precio_venta) || 0)
    })

    const margen = valorVenta - valorCompra
    const porcentajeMargen = valorCompra > 0 ? ((margen / valorCompra) * 100).toFixed(1) : '0.0'

    return [
      `Tu inventario actual representa:\n`,
      `\u2022 Valor en costo: S/. ${valorCompra.toFixed(2)}`,
      `\u2022 Valor en venta: S/. ${valorVenta.toFixed(2)}`,
      `\u2022 Margen potencial: S/. ${margen.toFixed(2)} (${porcentajeMargen}%)\n`,
      `Esto corresponde a ${totalUnidades} unidades en ${data.length} productos activos.`,
    ].join('\n')
  } catch (error) {
    console.error('Error en handleValorInventario:', error)
    return 'Tuve un problema al calcular el valor del inventario. Intenta de nuevo.'
  }
}

export async function handleConsultaProducto(mensaje, usuario) {
  try {
    const productos = await buscarProductoEnTexto(mensaje)

    if (!productos || productos.length === 0) {
      return 'No encuentro registros de ese producto en el sistema. Podrias darme el codigo exacto o revisar el nombre?'
    }

    if (productos.length > 1) {
      const lista = productos.map((p) => `\u2022 ${p.nombre} (${p.codigo})`).join('\n')
      return `Encontre varios productos similares:\n\n${lista}\n\nCual te interesa? Dame el codigo exacto.`
    }

    const p = productos[0]
    const stock = Number(p.stock_actual)
    const minimo = Number(p.stock_minimo)

    let estado
    if (stock === 0) {
      estado = 'SIN STOCK'
    } else if (stock <= minimo) {
      estado = 'STOCK BAJO'
    } else {
      estado = 'STOCK SALUDABLE'
    }

    const categoria = extraerNombre(p.categorias) || 'Sin categoria'
    const proveedor = extraerNombre(p.proveedores) || 'Sin proveedor'

    let respuesta = `${p.nombre} (${p.codigo})\n\n`
    respuesta += `Estado: ${estado}\n`
    respuesta += `Stock actual: ${stock} unidades\n`
    respuesta += `Stock minimo: ${minimo} unidades\n`
    respuesta += `Categoria: ${categoria}\n`
    respuesta += `Proveedor: ${proveedor}\n`

    if (usuario.rol === 'administrador') {
      respuesta += `Precio compra: S/. ${Number(p.precio_compra || 0).toFixed(2)}\n`
      respuesta += `Precio venta: S/. ${Number(p.precio_venta || 0).toFixed(2)}\n`
    }

    return respuesta
  } catch (error) {
    console.error('Error en handleConsultaProducto:', error)
    return 'Tuve un problema buscando ese producto. Intenta con el codigo exacto del producto.'
  }
}

export async function handlePrediccionAgotamiento(mensaje, _usuario) {
  try {
    const productos = await buscarProductoEnTexto(mensaje)

    if (!productos || productos.length === 0) {
      return 'No encuentro registros de ese producto en el sistema. Podrias darme el codigo exacto o revisar el nombre?'
    }

    const p = productos[0]
    const stockActual = Number(p.stock_actual)
    const productoId = p.id

    const fechaLimite = new Date()
    fechaLimite.setDate(fechaLimite.getDate() - 30)

    const { data: movimientos, error } = await supabase
      .from('movimientos')
      .select('cantidad')
      .eq('producto_id', productoId)
      .eq('tipo', 'salida')
      .gte('created_at', fechaLimite.toISOString())

    if (error) throw error

    const totalSalido = (movimientos || []).reduce(
      (sum, m) => sum + Number(m.cantidad), 0
    )
    const promedioDiario = totalSalido / 30

    if (promedioDiario === 0) {
      return `No hay suficiente historial de salidas de ${p.nombre} para hacer una prediccion confiable. Actualmente tiene ${stockActual} unidades.`
    }

    const diasRestantes = Math.floor(stockActual / promedioDiario)
    const promedioRedondeado = Math.round(promedioDiario * 10) / 10

    if (diasRestantes <= 3) {
      return `ALERTA: A este ritmo de consumo, ${p.nombre} se agotara en aproximadamente ${diasRestantes} dia${diasRestantes > 1 ? 's' : ''}. Te recomiendo reabastecer de inmediato.`
    }

    if (diasRestantes <= 10) {
      return `${p.nombre} tiene stock para aproximadamente ${diasRestantes} dias mas, basado en el consumo de los ultimos 30 dias (${promedioRedondeado} unidades/dia en promedio). Considera planificar la compra.`
    }

    return `${p.nombre} tiene stock saludable para aproximadamente ${diasRestantes} dias mas al ritmo actual de consumo. No requiere atencion inmediata.`
  } catch (error) {
    console.error('Error en handlePrediccionAgotamiento:', error)
    return 'Tuve un problema al calcular la prediccion de agotamiento. Intenta de nuevo.'
  }
}

export async function handleMovimientosRecientes(mensaje, usuario) {
  try {
    const msg = mensaje.toLowerCase()
    let tipoFiltro = null

    if (msg.includes('entrada') || msg.includes('entro')) {
      tipoFiltro = 'entrada'
    } else if (msg.includes('salida') || msg.includes('salio')) {
      tipoFiltro = 'salida'
    }

    let query = supabase
      .from('movimientos')
      .select('id, tipo, cantidad, motivo, created_at, productos!producto_id(nombre), usuarios!usuario_id(nombre)')
      .order('created_at', { ascending: false })
      .limit(10)

    if (tipoFiltro) {
      query = query.eq('tipo', tipoFiltro)
    }

    if (usuario.rol === 'empleado') {
      query = query.eq('usuario_id', usuario.id)
    }

    const { data, error } = await query
    if (error) throw error

    if (!data || data.length === 0) {
      return 'No se registraron movimientos en el periodo consultado.'
    }

    const tipoLabel = tipoFiltro || 'movimientos'
    let respuesta = `Aqui tienes los ${tipoLabel} mas recientes:\n\n`

    data.forEach((m) => {
      const hora = new Date(m.created_at).toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit',
      })
      const emoji = m.tipo === 'entrada' ? '\uD83D\uDCE5' : '\uD83D\uDCE4'
      respuesta += `\u2022 [${hora}] ${emoji} ${extraerNombre(m.productos) || 'Producto'}: ${m.cantidad} unidades (${m.motivo || 'Sin motivo'})\n`
    })

    return respuesta
  } catch (error) {
    console.error('Error en handleMovimientosRecientes:', error)
    return 'Tuve un problema al consultar los movimientos recientes. Intenta de nuevo.'
  }
}

export async function handleAnalisisCategoria(mensaje, _usuario) {
  try {
    const categoria = await buscarCategoriaEnTexto(mensaje)

    if (!categoria) {
      return 'No encuentro esa categoria en el sistema.'
    }

    const { data: productos, error } = await supabase
      .from('productos')
      .select('id, stock_actual, stock_minimo')
      .eq('categoria_id', categoria.id)
      .eq('activo', true)

    if (error) throw error

    const totalProductos = productos?.length || 0
    const stockTotal = (productos || []).reduce(
      (sum, p) => sum + Number(p.stock_actual), 0
    )
    const productosCriticos = (productos || []).filter(
      (p) => Number(p.stock_actual) <= Number(p.stock_minimo)
    ).length

    let respuesta = `Categoria ${categoria.nombre}:\n\n`
    respuesta += `\u2022 ${totalProductos} productos activos\n`
    respuesta += `\u2022 ${stockTotal} unidades en total\n`
    respuesta += productosCriticos > 0
      ? `\u2022 ${productosCriticos} producto${productosCriticos > 1 ? 's' : ''} con stock bajo en esta categoria\n`
      : `\u2022 Todos los productos tienen stock saludable\n`

    return respuesta
  } catch (error) {
    console.error('Error en handleAnalisisCategoria:', error)
    return 'Tuve un problema al analizar la categoria. Intenta de nuevo.'
  }
}

export async function handleAnalisisProveedor(mensaje, _usuario) {
  try {
    const proveedor = await buscarProveedorEnTexto(mensaje)

    if (!proveedor) {
      return 'No encuentro ese proveedor en el sistema.'
    }

    const { data: productos, error } = await supabase
      .from('productos')
      .select('id, nombre, codigo, stock_actual, stock_minimo, precio_compra, precio_venta')
      .eq('proveedor_id', proveedor.id)
      .eq('activo', true)

    if (error) throw error

    const totalProductos = productos?.length || 0
    const stockTotal = (productos || []).reduce(
      (sum, p) => sum + Number(p.stock_actual), 0
    )
    const valorTotal = (productos || []).reduce(
      (sum, p) => sum + Number(p.stock_actual) * (Number(p.precio_compra) || 0), 0
    )
    const productosCriticos = (productos || []).filter(
      (p) => Number(p.stock_actual) <= Number(p.stock_minimo)
    ).length

    let respuesta = `Proveedor ${proveedor.nombre}:\n\n`
    respuesta += `\u2022 ${totalProductos} productos activos\n`
    respuesta += `\u2022 ${stockTotal} unidades en total\n`
    respuesta += `\u2022 Valor en inventario: S/. ${valorTotal.toFixed(2)}\n`
    respuesta += productosCriticos > 0
      ? `\u2022 ${productosCriticos} producto${productosCriticos > 1 ? 's' : ''} requieren reposicion\n`
      : `\u2022 Todos los productos tienen stock saludable\n`

    if (productos && productos.length > 0) {
      respuesta += '\nProductos:\n'
      productos.slice(0, 5).forEach((p) => {
        respuesta += `\u2022 ${p.nombre} (${p.codigo}) — ${p.stock_actual} uds\n`
      })
      if (productos.length > 5) {
        respuesta += `...y ${productos.length - 5} producto${productos.length - 5 > 1 ? 's' : ''} mas\n`
      }
    }

    return respuesta
  } catch (error) {
    console.error('Error en handleAnalisisProveedor:', error)
    return 'Tuve un problema al analizar el proveedor. Intenta de nuevo.'
  }
}

export async function handleResumenGeneral(_mensaje, usuario) {
  try {
    const esAdmin = usuario.rol === 'administrador'

    const promises = [
      supabase.from('productos').select('id').eq('activo', true),
      supabase
        .from('productos')
        .select('id, stock_actual, stock_minimo')
        .eq('activo', true),
    ]

    if (esAdmin) {
      promises.push(
        supabase
          .from('productos')
          .select('stock_actual, precio_compra')
          .eq('activo', true)
      )
    }

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    promises.push(
      supabase
        .from('movimientos')
        .select('tipo')
        .gte('created_at', hoy.toISOString())
    )

    const [resProd, resCriticos, ...resto] = await Promise.all(promises)

    if (resProd.error) throw resProd.error

    const totalProductos = resProd.data?.length || 0
    const productosCriticos = (resCriticos.data || []).filter((p) => {
      const minimo = Number(p.stock_minimo) || 5
      return Number(p.stock_actual) <= minimo
    }).length

    let valorInventario = 0
    if (esAdmin && resto[0]?.data) {
      resto[0].data.forEach((p) => {
        valorInventario += Number(p.stock_actual) * (Number(p.precio_compra) || 0)
      })
    }

    const movimientosHoy = resto[esAdmin ? 1 : 0]?.data || []
    const entradasHoy = movimientosHoy.filter((m) => m.tipo === 'entrada').length
    const salidasHoy = movimientosHoy.filter((m) => m.tipo === 'salida').length

    let respuesta = 'Resumen general de tu inventario:\n\n'
    respuesta += `\u2022 ${totalProductos} productos activos\n`
    respuesta += `\u2022 ${productosCriticos} requieren atencion\n`

    if (esAdmin) {
      respuesta += `\u2022 Valor total: S/. ${valorInventario.toFixed(2)}\n`
    }

    respuesta += `\u2022 Hoy: ${entradasHoy} entrada${entradasHoy !== 1 ? 's' : ''}, ${salidasHoy} salida${salidasHoy !== 1 ? 's' : ''}\n\n`

    respuesta += productosCriticos > 0
      ? 'Te recomiendo revisar los productos con stock bajo cuando puedas.'
      : 'Todo se ve en orden por ahora.'

    return respuesta
  } catch (error) {
    console.error('Error en handleResumenGeneral:', error)
    return 'Tuve un problema al generar el resumen general. Intenta de nuevo.'
  }
}

export async function handleSaludo(_mensaje, usuario) {
  return `Hola ${usuario.nombre_completo || usuario.email}! Soy MARCEL, tu asistente de inventario. Puedo ayudarte a consultar stock, analizar tendencias de consumo, y darte alertas sobre productos criticos. En que te ayudo?`
}

export async function handleDesconocida(_mensaje, _usuario) {
  return [
    'No estoy seguro de haber entendido tu consulta. Puedo ayudarte con:',
    '',
    '\u2022 Consultar stock de productos',
    '\u2022 Ver que productos necesitan reposicion',
    '\u2022 Calcular el valor de tu inventario',
    '\u2022 Predecir cuando se agotara un producto',
    '\u2022 Revisar movimientos recientes',
    '',
    'Puedes reformular tu pregunta?',
  ].join('\n')
}
