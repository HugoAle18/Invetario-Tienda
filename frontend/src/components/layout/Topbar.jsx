import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { Menu, LogOut, User, Moon, Sun } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

const obtenerTitulo = (path) => {
  switch (path) {
    case '/admin/dashboard': return 'Dashboard'
    case '/admin/productos': return 'Productos'
    case '/admin/categorias': return 'Categorías'
    case '/admin/proveedores': return 'Proveedores'
    case '/admin/movimientos': return 'Movimientos'
    case '/admin/usuarios': return 'Usuarios'
    case '/admin/reportes': return 'Reportes'
    case '/admin/configuracion': return 'Configuración'
    default: return 'INVENTEX'
  }
}

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const { dark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="h-16 bg-white dark:bg-bg-secondary border-b border-gray-200 dark:border-bg-border flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden glass-btn-secondary p-2"
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>
         <h2 className="text-lg font-display font-semibold text-gray-900 dark:text-text-primary truncate">
          {obtenerTitulo(location.pathname)}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-bg-hover transition-colors"
          aria-label={dark ? 'Activar modo claro' : 'Activar modo oscuro'}
        >
          <span className={`inline-block transition-transform duration-300 ${dark ? 'rotate-0' : 'rotate-180'}`}>
            <Moon size={18} />
          </span>
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-bg-border">
          <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white text-sm font-semibold">
            {user?.nombre?.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900 dark:text-text-primary leading-tight">
              {user?.nombre}
            </p>
            <p className="text-xs text-gray-500 dark:text-text-secondary capitalize">{user?.rol}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-bg-hover hover:text-danger transition-colors"
          aria-label="Cerrar sesión"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
