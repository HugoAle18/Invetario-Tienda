import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Bot } from 'lucide-react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import AiAgentWidget from '@/components/ai/AiAgentWidget'
import { useAuth } from '@/context/AuthContext'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const { user } = useAuth()

  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-slate-50 via-slate-100 to-blue-100/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-all duration-500">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        role={user?.rol}
      />

      <div className="flex-1 flex flex-col min-h-screen bg-transparent">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full max-w-7xl mx-auto pb-20">
          <div className="w-full flex flex-col gap-6">
            <Outlet />
          </div>
        </main>
      </div>

      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer z-50 border border-white/20 group"
        aria-label="Abrir Agente IA"
      >
        <Bot size={22} className="group-hover:rotate-12 transition-transform duration-300" />
      </button>

      {isChatOpen && (
        <AiAgentWidget onClose={() => setIsChatOpen(false)} />
      )}
    </div>
  )
}
