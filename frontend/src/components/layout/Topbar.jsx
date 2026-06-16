import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { Sun, Moon, Menu, LogOut, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Topbar({ onMenuClick, title }) {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="h-16 bg-bg-secondary border-b border-bg-border flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg text-text-secondary hover:bg-bg-hover transition-colors"
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>
        <h2 className="text-lg font-display font-semibold text-text-primary truncate">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          className="p-2 rounded-lg text-text-secondary hover:bg-bg-hover transition-colors"
          aria-label="Cambiar tema"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-bg-border">
          <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white text-sm font-semibold">
            {user?.nombre?.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-text-primary leading-tight">
              {user?.nombre}
            </p>
            <p className="text-xs text-text-muted capitalize">{user?.rol}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="p-2 rounded-lg text-text-secondary hover:bg-bg-hover hover:text-danger transition-colors"
          aria-label="Cerrar sesión"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
