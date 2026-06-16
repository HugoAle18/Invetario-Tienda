import { useAuth } from '@/context/AuthContext'
import { Menu, LogOut, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Topbar({ onMenuClick, title }) {
  const { user, logout } = useAuth()
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
        <h2 className="text-lg font-display font-semibold text-white truncate">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 pl-2 border-l border-white/[0.06]">
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-white text-sm font-semibold">
            {user?.nombre?.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white leading-tight">
              {user?.nombre}
            </p>
            <p className="text-xs text-white/50 capitalize">{user?.rol}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="p-2 rounded-lg text-white/60 hover:bg-white/[0.10] hover:text-danger transition-colors"
          aria-label="Cerrar sesión"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
