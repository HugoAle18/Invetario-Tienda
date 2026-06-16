import { useState, useEffect, useRef } from 'react'

const VentanaChat = ({ onClose, productos = [], movimientos = [] }) => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: '¡Hola! Soy tu Agente Residente de IA. He analizado el inventario actual. Pregúntame sobre el stock de un artículo, qué productos están bajos o cuándo comprar mercancía.' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const procesarConsultaIA = (consulta) => {
    const texto = consulta.toLowerCase().trim()

    if (['hola', 'buen día', 'buenas', 'que tal', 'oe'].includes(texto)) {
      return "¡Hola! ¿En qué puedo ayudarte a optimizar el stock hoy? Puedes preguntarme por productos específicos, alertas de stock o predicciones de compra."
    }

    if (texto.includes('stock bajo') || texto.includes('alerta') || texto.includes('comprar') || texto.includes('predic') || texto.includes('cuando')) {
      const criticos = productos.filter(p => Number(p.stock_actual || p.stock) <= Number(p.stock_minimo || 5))

      if (criticos.length === 0) {
        return "He analizado el inventario y todos los niveles están saludables. Ningún producto está por debajo del stock mínimo establecido."
      }

      let respuesta = "⚠️ **Análisis de Reabastecimiento Crítico:**\n\nBasado en el ritmo de salidas y el stock mínimo, te sugiero comprar stock de los siguientes productos de inmediato:\n"

      criticos.forEach(p => {
        const stockActual = p.stock_actual !== undefined ? p.stock_actual : p.stock
        const salidasRecientes = movimientos.filter(m => m.producto === p.nombre && m.tipo === 'Salida').length

        respuesta += `• **${p.nombre}**: Tienes ${stockActual} unidades (Mínimo: ${p.stock_minimo || 5}). `

        if (salidasRecientes > 2) {
          respuesta += `*¡Alta demanda! Se predice rotura de stock en menos de 3 días.*\n`
        } else {
          respuesta += `*Se recomienda reabastecer esta semana.*\n`
        }
      })
      return respuesta
    }

    if (texto.includes('inventario') || texto.includes('resumen') || texto.includes('analiza')) {
      const totalProductos = productos.length
      const valorTotal = productos.reduce((acc, p) => acc + (Number(p.stock_actual || p.stock || 0) * Number(p.precio || p.precio_venta || 0)), 0)
      const stockBajoCount = productos.filter(p => Number(p.stock_actual || p.stock) <= Number(p.stock_minimo || 5)).length

      return `📊 **Análisis General del Inventario:**\n\n• **Variedad:** Cuentas con ${totalProductos} productos registrados.\n• **Valor del Almacén:** El capital total invertido estimado es de **S/. ${valorTotal.toFixed(2)}**.\n• **Riesgos:** Hay ${stockBajoCount} alertas activas de stock bajo que requieren tu atención inmediata para evitar perder ventas.`
    }

    const palabrasClave = texto.split(' ').filter(w => w.length > 3 && !['cuanto', 'stock', 'tiene', 'sobre', 'para', 'esta'].includes(w))

    if (palabrasClave.length > 0) {
      const productoEncontrado = productos.find(p =>
        palabrasClave.some(palabra => p.nombre.toLowerCase().includes(palabra))
      )

      if (productoEncontrado) {
        const stockActual = productoEncontrado.stock_actual !== undefined ? productoEncontrado.stock_actual : productoEncontrado.stock
        const estado = stockActual <= (productoEncontrado.stock_minimo || 5) ? "🔴 CRÍTICO (Requiere compra)" : "🟢 SALUDABLE"

        return `🔍 **Reporte de Artículo:**\n\nEl producto **${productoEncontrado.nombre}** cuenta con **${stockActual}** unidades en almacén. \n• **Estado:** ${estado}\n• **Precio de Venta:** S/. ${productoEncontrado.precio || productoEncontrado.precio_venta}\n• **Categoría:** ${productoEncontrado.categoria || 'General'}`
      }
    }

    return "No pude identificar el producto o la métrica exacta. Prueba consultando de formas simples como: *'¿Qué debo comprar?'*, *'Analiza el inventario'* o el nombre específico de un producto como *'Shampoo'* o *'Mochila'*."
  }

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const mensajeUsuario = input
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: mensajeUsuario }])
    setInput('')
    setIsLoading(true)

    setTimeout(() => {
      const respuestaIA = procesarConsultaIA(mensajeUsuario)
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: respuestaIA }])
      setIsLoading(false)
    }, 600)
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
              <p className="text-[10px] text-blue-100">Analista Predictivo Activo</p>
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
            placeholder="Escribe 'analizar', 'comprar stock' o un producto..."
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

export const AiAgentWidget = ({ productos = [], movimientos = [] }) => {
  const [isOpen, setIsOpen] = useState(false)

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
          productos={productos}
          movimientos={movimientos}
        />
      )}
    </>
  )
}
