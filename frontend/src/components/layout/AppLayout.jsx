import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { AiAgentWidget } from '@/components/ai/AiAgentWidget'
import { useAuth } from '@/context/AuthContext'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
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

      <AiAgentWidget />
    </div>
  )
}
