import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { useAuth } from '@/context/AuthContext'

const titles = {
  '/admin/dashboard': 'Dashboard',
  '/admin/productos': 'Productos',
  '/admin/categorias': 'Categorías',
  '/admin/proveedores': 'Proveedores',
  '/admin/movimientos': 'Movimientos',
  '/admin/usuarios': 'Usuarios',
  '/admin/reportes': 'Reportes',
  '/admin/configuracion': 'Configuración',
  '/empleado/panel': 'Panel',
  '/empleado/stock': 'Stock',
  '/empleado/entrada': 'Registrar Entrada',
  '/empleado/salida': 'Registrar Salida',
  '/empleado/movimientos': 'Mis Movimientos',
}

export default function AppLayout({ title: forcedTitle }) {
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
          title={forcedTitle || (user && titles[window.location.pathname]) || ''}
        />
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
