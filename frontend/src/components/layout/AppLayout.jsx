import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
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

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 min-h-screen overflow-y-auto flex flex-col items-center bg-transparent w-full">
          <div className="w-full max-w-7xl px-4 md:px-8 py-6 flex flex-col gap-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
