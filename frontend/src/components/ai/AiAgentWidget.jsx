import { useState, useRef, useMemo, useEffect } from 'react'

const SALUDOS = ['hola', 'buen dia', 'buenas', 'que tal', 'buenos dias', 'buenas tardes', 'buenas noches']

function extraerContexto(productos, categorias, proveedores, movimientos) {
  return {
    fecha_actual: new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' }),
    productos: productos.map(p => ({
      codigo: p.codigo,
      nombre: p.nombre,
      categoria: p.categoria || 'Sin categoría',
      stock: p.stock ?? p.stock_actual ?? 0,
      precio: p.precio_venta || p.precio || 0,
    })),
    categorias: categorias.map(c => c.nombre),
    proveedores: proveedores.map(pr => pr.nombre),
    ultimos_movimientos: movimientos.slice(0, 20).map(m => ({
      producto: m.producto || m.productos?.nombre,
      tipo: m.tipo,
      cantidad: m.cantidad,
      motivo: m.motivo,
      fecha: m.created_at ? new Date(m.created_at).toLocaleDateString('es-PE') : '',
    })),
  }
}

function procesarConsulta(consulta, ctx) {
  const texto = consulta.toLowerCase().trim()
  const { productos, categorias, proveedores, ultimos_movimientos, fecha_actual } = ctx

  if (SALUDOS.includes(texto)) {
    return `¡Hola! Soy el Agente Residente de INVENTEX. Puedes preguntarme sobre productos, stock, categorías, proveedores o movimientos. ¿En qué te ayudo?`
  }

  if (texto === 'ayuda' || texto === 'help' || texto === 'que puedes hacer' || texto === 'comandos') {
    return (
      '**Comandos disponibles:**\n\n' +
      '• "resumen del inventario" — estadísticas generales\n' +
      '• "stock bajo" o "alertas" — productos que necesitan reabastecimiento\n' +
      '• "categorías" — listar todas las categorías\n' +
      '• "proveedores" — listar todos los proveedores\n' +
      '• "últimos movimientos" — ver actividad reciente\n' +
      '• Nombre de un producto — consultar su stock y precio\n' +
      '• "productos de [categoría]" — filtrar por categoría\n' +
      '• "stock de [producto]" — cantidad exacta en almacén'
    )
  }

  if (texto === 'resumen del inventario' || texto === 'resumen' || texto.includes('analiza') || texto.includes('inventario') && !texto.includes('producto') && !texto.includes('categoria')) {
    if (productos.length === 0) return 'No hay productos registrados en el sistema actual.'

    const totalProductos = productos.length
    const valorTotal = productos.reduce((acc, p) => acc + (p.stock * p.precio), 0)
    const stockBajo = productos.filter(p => p.stock <= 5)
    const sinStock = productos.filter(p => p.stock === 0)
    const porCategoria = {}
    productos.forEach(p => {
      porCategoria[p.categoria] = (porCategoria[p.categoria] || 0) + 1
    })

    let res = `**Resumen del Inventario — ${fecha_actual}**\n\n`
    res += `• **Total de productos:** ${totalProductos}\n`
    res += `• **Valor del almacén:** S/ ${valorTotal.toFixed(2)}\n`
    res += `• **Productos con stock bajo:** ${stockBajo.length}\n`
    res += `• **Productos sin stock:** ${sinStock.length}\n\n`
    res += `**Productos por categoría:**\n`
    Object.entries(porCategoria).forEach(([cat, count]) => {
      res += `  • ${cat}: ${count}\n`
    })
    return res
  }

  if (texto === 'categorias' || texto === 'categorías' || texto === 'listar categorias' || texto === 'que categorias hay' || texto.includes('categoria')) {
    if (categorias.length === 0) return 'No hay categorías registradas en el sistema.'
    let res = `**Categorías del sistema (${categorias.length}):**\n`
    categorias.forEach(c => { res += `  • ${c}\n` })
    return res
  }

  if (texto === 'proveedores' || texto === 'listar proveedores' || texto.includes('proveedor')) {
    if (proveedores.length === 0) return 'No hay proveedores registrados en el sistema.'
    let res = `**Proveedores registrados (${proveedores.length}):**\n`
    proveedores.forEach(p => { res += `  • ${p}\n` })
    return res
  }

  if (texto.includes('ultimos movimientos') || texto.includes('últimos movimientos') || texto.includes('movimientos recientes') || texto === 'movimientos') {
    if (ultimos_movimientos.length === 0) return 'No hay movimientos registrados.'
    let res = `**Últimos ${ultimos_movimientos.length} movimientos:**\n\n`
    ultimos_movimientos.forEach(m => {
      res += `• ${m.tipo === 'entrada' ? '📥 Entrada' : '📤 Salida'} — ${m.producto || 'N/A'} (${m.cantidad} und) — ${m.motivo}\n`
    })
    return res
  }

  if (texto.includes('stock bajo') || texto.includes('alerta') || texto.includes('reabastecer') || texto.includes('comprar stock') || texto.includes('que comprar') || texto.includes('que debo comprar')) {
    const criticos = productos.filter(p => p.stock <= 5)
    if (criticos.length === 0) return 'Todos los productos tienen stock saludable. No se necesita reabastecimiento urgente.'
    let res = `**⚠️ Productos que requieren reabastecimiento (${criticos.length}):**\n\n`
    criticos.forEach(p => {
      res += `• **${p.nombre}** — ${p.stock} unidades (mínimo sugerido: 5)\n`
    })
    return res
  }

  const matchCategoria = texto.match(/productos de (.+)/) || texto.match(/productos en (.+)/)
  if (matchCategoria) {
    const catBuscada = matchCategoria[1].toLowerCase().trim()
    const prodsCat = productos.filter(p => p.categoria.toLowerCase().includes(catBuscada))
    if (prodsCat.length === 0) return `No encuentro productos en la categoría "${matchCategoria[1]}" en el sistema actual.`
    let res = `**Productos en ${prodsCat[0].categoria} (${prodsCat.length}):**\n\n`
    prodsCat.forEach(p => {
      res += `• **${p.nombre}** — S/ ${p.precio.toFixed(2)} — Stock: ${p.stock}\n`
    })
    return res
  }

  if (texto.includes('stock de ') || texto.includes('cuantos ') || texto.includes('cuantas ') || texto.includes('cuanto ') || texto.includes('stock del ')) {
    const palabrasExcluir = ['stock', 'de', 'del', 'cuanto', 'cuantos', 'cuantas', 'hay', 'tiene', 'tienen', 'en', 'el', 'la', 'los', 'las', 'un', 'una']
    const palabras = texto.split(' ').filter(w => w.length > 2 && !palabrasExcluir.includes(w))
    const encontrado = productos.find(p =>
      palabras.some(palabra => p.nombre.toLowerCase().includes(palabra))
    )
    if (encontrado) {
      return `**${encontrado.nombre}** — Stock actual: **${encontrado.stock} unidades** — Precio: S/ ${encontrado.precio.toFixed(2)}`
    }
  }

  const palabrasExcluir = ['stock', 'de', 'del', 'precio', 'categoria', 'producto', 'hay', 'tiene', 'tienen', 'sobre', 'para', 'esta', 'como', 'que', 'con', 'por', 'los', 'las', 'en', 'el', 'la', 'un', 'una', 'cuanto', 'cuantos', 'informacion', 'dame', 'muestrame', 'buscar']
  const palabrasClave = texto.split(' ').filter(w => w.length > 2 && !palabrasExcluir.includes(w))

  if (palabrasClave.length > 0) {
    const encontrados = productos.filter(p =>
      palabrasClave.some(palabra =>
        p.nombre.toLowerCase().includes(palabra) ||
        (p.codigo && p.codigo.toLowerCase() === palabra)
      )
    )

    if (encontrados.length > 0) {
      let res = ''
      encontrados.forEach(p => {
        const estado = p.stock <= 5 ? '🔴 Stock bajo' : '🟢 Normal'
        res += `**${p.nombre}** (${p.codigo})\n`
        res += `  • Categoría: ${p.categoria}\n`
        res += `  • Stock: ${p.stock} — ${estado}\n`
        res += `  • Precio: S/ ${p.precio.toFixed(2)}\n\n`
      })
      return res.trim()
    }
  }

  return 'No encuentro registros de ese artículo en el sistema actual. Consulta por nombre de producto, categoría, o escribe "ayuda" para ver los comandos disponibles.'
}

const VentanaChat = ({ onClose, sistemaContexto }) => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: '¡Hola! Soy tu Agente de IA de INVENTEX. Pregúntame sobre productos, stock, categorías o proveedores.' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const mensajeUsuario = input
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: mensajeUsuario }])
    setInput('')
    setIsLoading(true)

    setTimeout(() => {
      const respuesta = procesarConsulta(mensajeUsuario, sistemaContexto)
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: respuesta }])
      setIsLoading(false)
    }, 400)
  }

  return (
    <>
      <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-40" onClick={onClose} />

      <div className="fixed bottom-24 right-6 w-96 h-[550px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-8rem)] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">

        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
            <div>
              <h3 className="font-bold text-sm tracking-wide">Agente Residente IA</h3>
              <p className="text-[10px] text-blue-100">Analista de Inventario</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white/80 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/20">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm whitespace-pre-line ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none font-medium'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/50 dark:border-slate-700/50 leading-relaxed'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-200/50 dark:border-slate-700/50 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Producto, stock, categoría..."
            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          <button type="submit" className="p-2.5 rounded-xl bg-indigo-600 text-white font-bold shadow-md cursor-pointer active:scale-95">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </div>
    </>
  )
}

export const AiAgentWidget = ({ productos = [], categorias = [], proveedores = [], movimientos = [] }) => {
  const [isOpen, setIsOpen] = useState(false)

  const sistemaContexto = useMemo(() =>
    extraerContexto(productos, categorias, proveedores, movimientos),
    [productos, categorias, proveedores, movimientos]
  )

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer z-50 border border-white/20 group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>

      {isOpen && (
        <VentanaChat
          onClose={() => setIsOpen(false)}
          sistemaContexto={sistemaContexto}
        />
      )}
    </>
  )
}
