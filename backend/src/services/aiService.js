import supabase from '../config/supabase.js'

const SYSTEM_PROMPT = `
Actuas como el Agente Analista Residente de INVENTEX, un ERP inteligente de inventario.
Tu objetivo es ayudar al administrador a tomar decisiones de compras, auditoria y optimizacion
basandote estrictamente en los datos que se te proporcionan.

Si te preguntan por predicciones de stock, analiza la relacion entre el stock actual,
el stock minimo y el historial reciente de movimientos (salidas).

NO inventes datos. Si no tienes suficiente informacion para responder, dilo claramente.
Se conciso, profesional y estructurado en tus respuestas. Usa Markdown para dar formato
elegante a las listas o alertas que generes.

DATOS EN TIEMPO REAL DEL INVENTARIO:
`

function formatearMovimientos(movs) {
  return movs.map((m) => ({
    p: m.productos?.nombre || '?',
    t: m.tipo,
    c: m.cantidad,
    f: m.created_at?.slice(0, 10),
    u: m.usuarios?.nombre || '?',
  }))
}

function armarContexto(productos, movimientos, usuarioRol) {
  const activos = productos.filter((p) => p.activo !== false)
  const alertas = activos.filter((p) => p.stock_actual <= p.stock_minimo)
  const sinStock = activos.filter((p) => p.stock_actual <= 0)
  const totalValor = activos.reduce((s, p) => s + (p.stock_actual * (p.precio_compra || 0)), 0)

  const ctx = {
    resumen: {
      total_productos: activos.length,
      total_categorias: [...new Set(activos.map((p) => p.categorias?.nombre).filter(Boolean))].length,
      total_proveedores: [...new Set(activos.map((p) => p.proveedores?.nombre).filter(Boolean))].length,
      total_stock_unidades: activos.reduce((s, p) => s + p.stock_actual, 0),
      valor_inventario_soles: totalValor,
      productos_sin_stock: sinStock.length,
      productos_bajo_stock: alertas.length,
      total_movimientos_30d: movimientos.length,
    },
    alertas: alertas.map((p) => ({
      n: p.nombre,
      st: p.stock_actual,
      min: p.stock_minimo,
      cat: p.categorias?.nombre || '-',
    })),
    productos: activos.map((p) => ({
      n: p.nombre,
      cod: p.codigo,
      cat: p.categorias?.nombre || '-',
      prov: p.proveedores?.nombre || '-',
      st: p.stock_actual,
      min: p.stock_minimo,
      pc: Number(p.precio_compra).toFixed(2),
      pv: Number(p.precio_venta).toFixed(2),
    })),
    movimientos_recientes: formatearMovimientos(movimientos.slice(0, 50)),
  }

  if (usuarioRol === 'empleado') {
    ctx.productos = ctx.productos.map(({ pc, pv, ...rest }) => rest)
  }

  return JSON.stringify(ctx, null, 2)
}

export async function consultarAgente(mensajeUsuario, usuarioRol) {
  try {
    const [prodRes, movRes] = await Promise.all([
      supabase
        .from('productos')
        .select(`
          id, codigo, nombre, descripcion, precio_compra, precio_venta,
          stock_minimo, stock_actual, activo,
          categorias!categoria_id (nombre),
          proveedores!proveedor_id (nombre)
        `)
        .order('nombre'),
      supabase
        .from('movimientos')
        .select(`
          id, tipo, cantidad, created_at,
          productos!producto_id (nombre),
          usuarios!usuario_id (nombre)
        `)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(100),
    ])

    if (prodRes.error) throw prodRes.error
    if (movRes.error) throw movRes.error

    const contexto = armarContexto(prodRes.data || [], movRes.data || [], usuarioRol)

    const provider = process.env.AI_PROVIDER || 'mock'
    const apiKey = process.env.AI_API_KEY

    if (!apiKey || provider === 'mock') {
      return responderModoMock(mensajeUsuario, JSON.parse(contexto))
    }

    const body = construirPayload(provider, SYSTEM_PROMPT + contexto, mensajeUsuario)
    const url = obtenerUrl(provider)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(provider === 'openai' && { Authorization: `Bearer ${apiKey}` }),
        ...(provider === 'anthropic' && { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' }),
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    })

    if (!response.ok) {
      throw new Error(`LLM API responded with ${response.status}`)
    }

    const data = await response.json()
    return extraerRespuesta(provider, data)
  } catch (error) {
    console.error('[AiAgent] Error:', error)
    return '_Lo siento, tuve un problema al conectar con mi cerebro analitico. Por favor, intentalo de nuevo._'
  }
}

function construirPayload(provider, systemContent, userMessage) {
  switch (provider) {
    case 'openai':
      return {
        model: process.env.AI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemContent },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }
    case 'anthropic':
      return {
        model: process.env.AI_MODEL || 'claude-3-haiku-20240307',
        system: systemContent,
        messages: [{ role: 'user', content: userMessage }],
        temperature: 0.3,
        max_tokens: 1000,
      }
    default:
      return { messages: [{ role: 'system', content: systemContent }, { role: 'user', content: userMessage }] }
  }
}

function obtenerUrl(provider) {
  switch (provider) {
    case 'openai':
      return 'https://api.openai.com/v1/chat/completions'
    case 'anthropic':
      return 'https://api.anthropic.com/v1/messages'
    default:
      return ''
  }
}

function extraerRespuesta(provider, data) {
  switch (provider) {
    case 'openai':
      return data.choices?.[0]?.message?.content || '_Sin respuesta_'
    case 'anthropic':
      return data.content?.[0]?.text || '_Sin respuesta_'
    default:
      return '_Sin respuesta_'
  }
}

function responderModoMock(mensaje, ctx) {
  const msg = mensaje.toLowerCase()

  if (msg.includes('comprar') || msg.includes('reabastec') || msg.includes('orden') || msg.includes('pedido')) {
    const criticos = ctx.alertas.filter((a) => a.st <= 0)
    const bajos = ctx.alertas.filter((a) => a.st > 0 && a.st <= a.min)
    let r = '### Analisis de Reabastecimiento\n\n'
    if (criticos.length > 0) {
      r += `**Productos sin stock (URGENTE):**\n`
      criticos.forEach((p) => { r += `- ${p.n} — sin unidades, stock minimo ${p.min}\n` })
      r += '\n'
    }
    if (bajos.length > 0) {
      r += `**Productos por debajo del minimo:**\n`
      bajos.forEach((p) => { r += `- ${p.n} — ${p.st} uds (min: ${p.min}), reponer ${p.min - p.st} uds\n` })
      r += '\n'
    }
    if (criticos.length === 0 && bajos.length === 0) {
      r += 'No se detectan productos que requieran reabastecimiento urgente. Todos los niveles de stock son adecuados.\n'
    }
    r += `\n_Resumen: ${ctx.resumen.total_productos} productos activos, ${ctx.resumen.valor_inventario_soles.toFixed(2)} S/ en inventario._`
    return r
  }

  if (msg.includes('resumen') || msg.includes('dashboard') || msg.includes('panorama') || msg.includes('general')) {
    return `### Panorama General del Inventario\n\n- **Productos activos:** ${ctx.resumen.total_productos}\n- **Categorias:** ${ctx.resumen.total_categorias}\n- **Proveedores:** ${ctx.resumen.total_proveedores}\n- **Unidades en stock:** ${ctx.resumen.total_stock_unidades}\n- **Valor del inventario:** S/ ${ctx.resumen.valor_inventario_soles.toFixed(2)}\n- **Sin stock:** ${ctx.resumen.productos_sin_stock}\n- **Bajo stock minimo:** ${ctx.resumen.productos_bajo_stock}\n- **Movimientos (30d):** ${ctx.resumen.total_movimientos_30d}`
  }

  if (msg.includes('categoria') || msg.includes('categoria')) {
    const cats = {}
    ctx.productos.forEach((p) => {
      const c = p.cat || 'Sin categoria'
      if (!cats[c]) cats[c] = 0
      cats[c]++
    })
    let r = '### Productos por Categoria\n\n'
    Object.entries(cats)
      .sort((a, b) => b[1] - a[1])
      .forEach(([c, n]) => { r += `- **${c}:** ${n} producto(s)\n` })
    return r
  }

  if (msg.includes('alerta') || msg.includes('critico') || msg.includes('stock bajo') || msg.includes('reponer')) {
    if (ctx.alertas.length === 0) return 'No hay alertas de stock bajo en este momento. Todos los productos tienen inventario suficiente.'
    let r = `### Alertas de Stock Bajo (${ctx.alertas.length})\n\n`
    ctx.alertas.forEach((a) => {
      const emoji = a.st <= 0 ? '🚨' : '⚠️'
      r += `${emoji} **${a.n}** — ${a.st} uds (min: ${a.min}) | ${a.cat}\n`
    })
    return r
  }

  if (msg.includes('proveedor') || msg.includes('proveedores')) {
    const provs = {}
    ctx.productos.forEach((p) => {
      const pr = p.prov || 'Sin proveedor'
      if (!provs[pr]) provs[pr] = []
      provs[pr].push(p.n)
    })
    let r = '### Productos por Proveedor\n\n'
    Object.entries(provs)
      .sort((a, b) => b[1].length - a[1].length)
      .forEach(([pr, prods]) => {
        r += `**${pr}:** ${prods.length} producto(s)\n`
        prods.slice(0, 5).forEach((np) => { r += `  - ${np}\n` })
        if (prods.length > 5) r += `  _...y ${prods.length - 5} mas_\n`
        r += '\n'
      })
    return r
  }

  if (msg.includes('movimiento') || msg.includes('entrada') || msg.includes('salida') || msg.includes('historial')) {
    const entradas = ctx.movimientos_recientes.filter((m) => m.t === 'entrada').length
    const salidas = ctx.movimientos_recientes.filter((m) => m.t === 'salida').length
    let r = `### Movimientos Recientes (30 dias)\n\n- **Total:** ${ctx.movimientos_recientes.length}\n- **Entradas:** ${entradas}\n- **Salidas:** ${salidas}\n\n`
    if (ctx.movimientos_recientes.length > 0) {
      r += '**Ultimos:**\n'
      ctx.movimientos_recientes.slice(0, 5).forEach((m) => {
        const icono = m.t === 'entrada' ? '📥' : '📤'
        r += `${icono} ${m.p} — ${m.t} de ${m.c} uds (${m.f})\n`
      })
    }
    return r
  }

  return `Hola, soy el Agente Residente de INVENTEX. Puedo ayudarte con:\n\n- **Resumen general** del inventario\n- **Alertas** de stock bajo o productos criticos\n- **Recomendaciones de compra** basadas en stock actual\n- **Analisis por categoria** o **proveedor**\n- **Historial de movimientos** recientes\n\n¿Que deseas consultar?`
}
