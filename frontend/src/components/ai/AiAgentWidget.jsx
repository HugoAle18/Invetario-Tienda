import { useState, useRef, useEffect } from 'react'
import { marcelApi } from '@/api/marcel'

const SUGERENCIAS = [
  '¿Qué productos tienen stock bajo?',
  '¿Cuánto vale mi inventario?',
  'Dame un resumen general',
  '¿Qué entró hoy?',
]

const VentanaChat = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: '¡Hola! Soy MARCEL, tu asistente de IA para INVENTEX. He analizado el inventario actual. Pregúntame sobre el stock de un artículo, qué productos están bajos o cuándo comprar mercancía.' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const mensajeUsuario = input
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: mensajeUsuario }])
    setInput('')
    setIsLoading(true)

    try {
      const { respuesta } = await marcelApi.chat(mensajeUsuario)
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: respuesta }])
    } catch {
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: 'Tuve un problema procesando tu consulta. Intenta reformularla.' }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSugerencia = async (texto) => {
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text }])
    setIsLoading(true)
    try {
      const { respuesta } = await marcelApi.chat(texto)
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: respuesta }])
    } catch {
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: 'Tuve un problema procesando tu consulta. Intenta reformularla.' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-40" onClick={onClose} />

      <div className="fixed bottom-24 right-6 w-96 h-[550px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-8rem)] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">

        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
            <div>
              <h3 className="font-bold text-sm tracking-wide">MARCEL AI</h3>
              <p className="text-[10px] text-blue-100">Analista de Inventario Inteligente</p>
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
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 px-1">
              {SUGERENCIAS.map((texto) => (
                <button
                  key={texto}
                  onClick={() => handleSugerencia(texto)}
                  className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-200 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer"
                >
                  {texto}
                </button>
              ))}
            </div>
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-200/50 dark:border-slate-700/50 flex items-center gap-2 text-xs text-slate-400">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="ml-1">MARCEL está pensando...</span>
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

export const AiAgentWidget = () => {
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
        />
      )}
    </>
  )
}
