import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { Menu, LogOut, User, Moon, Sun } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Topbar({ onMenuClick, title }) {
  const { user, logout } = useAuth()
  const { dark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="h-16 glass flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden glass-btn-secondary p-2"
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
          onClick={toggleTheme}
          className="p-2 rounded-lg text-text-secondary hover:bg-bg-hover transition-colors"
          aria-label={dark ? 'Activar modo claro' : 'Activar modo oscuro'}
        >
          <Sun size={18} className={`transition-transform duration-300 ${dark ? 'rotate-0 scale-100' : 'rotate-90 scale-0'} absolute`} />
          <Moon size={18} className={`transition-transform duration-300 ${dark ? '-rotate-90 scale-0' : 'rotate-0 scale-100'}`} />
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-glass-border">
          <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white text-sm font-semibold">
            {user?.nombre?.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-text-primary leading-tight">
              {user?.nombre}
            </p>
            <p className="text-xs text-text-secondary capitalize">{user?.rol}</p>
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
