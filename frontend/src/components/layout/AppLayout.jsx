import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { useAuth } from '@/context/AuthContext'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()

  return (
    <div className="min-h-screen flex">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        role={user?.rol}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 min-h-screen bg-gray-50 dark:bg-bg-primary p-4 md:p-8 flex flex-col items-center overflow-auto">
          <div className="w-full max-w-6xl flex flex-col gap-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
