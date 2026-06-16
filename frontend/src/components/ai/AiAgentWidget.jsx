import { useState, useRef, useEffect } from 'react'
import { Bot, Sparkles, Send, X, Loader2 } from 'lucide-react'
import { consultarAgenteIA } from '@/services/aiService'

const MENSAJES_INICIALES = [
  {
    rol: 'agent',
    texto: `¡Hola! Soy el **Agente Residente** de INVENTEX. Puedo ayudarte con:

- 📊 **Resumen general** del inventario
- 🚨 **Alertas** de stock bajo o productos críticos
- 🛒 **Recomendaciones de compra** basadas en el stock actual
- 📦 **Análisis por categoría** o **proveedor**
- 📋 **Historial de movimientos** recientes

¿Qué deseas consultar?`,
  },
]

function formatearRespuesta(texto) {
  if (!texto) return ''
  return texto
    .replace(/^### (.+)$/gm, '<h4 class="text-sm font-bold text-gray-900 dark:text-white mb-2 mt-1">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 class="text-base font-bold text-gray-900 dark:text-white mb-2">$1</h3>')
    .replace(/^# (.+)$/gm, '<h2 class="text-lg font-bold text-gray-900 dark:text-white mb-2">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>')
    .replace(/_(.+?)_/g, '<em class="italic text-gray-500 dark:text-gray-400">$1</em>')
    .replace(/^- (.+)$/gm, '<li class="ml-3 text-gray-700 dark:text-gray-200 list-disc">$1</li>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')
}

export default function AiAgentWidget() {
  const [open, setOpen] = useState(false)
  const [mensajes, setMensajes] = useState(MENSAJES_INICIALES)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatRef = useRef(null)
  const inputRef = useRef(null)
  const widgetRef = useRef(null)

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [mensajes])

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  useEffect(() => {
    function handleClickOutside(e) {
      if (widgetRef.current && !widgetRef.current.contains(e.target) && open) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const enviarMensaje = async () => {
    const texto = input.trim()
    if (!texto || loading) return

    setMensajes((prev) => [...prev, { rol: 'user', texto }])
    setInput('')
    setLoading(true)

    try {
      const respuesta = await consultarAgenteIA(texto)
      setMensajes((prev) => [...prev, { rol: 'agent', texto: respuesta }])
    } catch {
      setMensajes((prev) => [
        ...prev,
        {
          rol: 'agent',
          texto: '_Lo siento, tuve un problema al conectar con mi cerebro analítico. Por favor, inténtalo de nuevo._',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviarMensaje()
    }
  }

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer z-50 border border-white/20 group"
        aria-label="Abrir Agente IA"
      >
        <Bot size={22} className="group-hover:rotate-12 transition-transform duration-300" />
      </button>

      {/* Ventana de chat */}
      {open && (
        <div
          ref={widgetRef}
          className="fixed bottom-24 right-6 w-96 h-[550px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-8rem)] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50"
        >
          {/* Encabezado */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex items-center justify-between shadow-sm shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white/20">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-tight">Agente Residente IA</h3>
                <p className="text-[10px] text-blue-100 font-medium">Analista de Inventario</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
              aria-label="Cerrar"
            >
              <X size={16} />
            </button>
          </div>

          {/* Mensajes */}
          <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-2 scroll-smooth">
            {mensajes.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.rol === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={
                    msg.rol === 'user'
                      ? 'max-w-[80%] bg-blue-600 text-white p-3 rounded-2xl rounded-tr-none text-sm font-medium shadow-sm my-1'
                      : 'max-w-[80%] bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 p-3 rounded-2xl rounded-tl-none text-sm shadow-sm my-1 border border-slate-200/30 dark:border-slate-700/30 leading-relaxed font-sans'
                  }
                  dangerouslySetInnerHTML={
                    msg.rol === 'agent' ? { __html: formatearRespuesta(msg.texto) } : undefined
                  }
                >
                  {msg.rol === 'user' && msg.texto}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 p-3 rounded-2xl rounded-tl-none text-sm shadow-sm border border-slate-200/30 dark:border-slate-700/30">
                  <Loader2 size={16} className="animate-spin inline mr-2" />
                  Analizando inventario...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 p-3 bg-white/50 dark:bg-slate-950/50 border-t border-slate-200/40 dark:border-slate-800/40 shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pregunta al agente..."
              disabled={loading}
              className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400 dark:placeholder-slate-500 disabled:opacity-50"
            />
            <button
              onClick={enviarMensaje}
              disabled={loading || !input.trim()}
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white transition-all cursor-pointer disabled:cursor-not-allowed font-bold"
              aria-label="Enviar"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
