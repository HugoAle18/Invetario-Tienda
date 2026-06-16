import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { Menu, LogOut, Moon, Bell } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { notificacionesApi } from '@/api/notificaciones'
import toast from 'react-hot-toast'
import NotificationsPanel from '@/components/ui/NotificationsPanel'

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
    case '/empleado/panel': return 'Panel'
    case '/empleado/stock': return 'Stock'
    case '/empleado/entrada': return 'Entrada'
    case '/empleado/salida': return 'Salida'
    case '/empleado/movimientos': return 'Movimientos'
    default: return 'INVENTEX'
  }
}

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const { dark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const [panelOpen, setPanelOpen] = useState(false)
  const [notificaciones, setNotificaciones] = useState([])
  const [noLeidas, setNoLeidas] = useState(0)
  const [loadingNotif, setLoadingNotif] = useState(false)
  const prevCountRef = useRef(0)
  const panelRef = useRef(null)

  const fetchNotificaciones = useCallback(async () => {
    try {
      const { data: notifData } = await notificacionesApi.listar({ limit: 20 })
      const data = notifData?.data || notifData || []
      setNotificaciones(data)

      const { data: countData } = await notificacionesApi.contarNoLeidas()
      const count = countData?.count || 0

      if (count > prevCountRef.current && prevCountRef.current > 0) {
        toast.success(`${count - prevCountRef.current} notificación(es) nueva(s)`, {
          icon: '🔔',
          duration: 3000,
        })
      }
      prevCountRef.current = count
      setNoLeidas(count)
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    if (!user) return
    fetchNotificaciones()
    const interval = setInterval(fetchNotificaciones, 10000)
    const onRefresh = () => { fetchNotificaciones() }
    window.addEventListener('notifications-refresh', onRefresh)
    return () => {
      clearInterval(interval)
      window.removeEventListener('notifications-refresh', onRefresh)
    }
  }, [user, fetchNotificaciones])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setPanelOpen(false)
      }
    }
    if (panelOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      setLoadingNotif(true)
      fetchNotificaciones().finally(() => setLoadingNotif(false))
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [panelOpen, fetchNotificaciones])

  const handleMarcarLeida = async (id) => {
    await notificacionesApi.marcarLeida(id)
    setNoLeidas((prev) => Math.max(0, prev - 1))
    setNotificaciones((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
    )
  }

  const handleMarcarTodasLeidas = async () => {
    await notificacionesApi.marcarTodasLeidas()
    setNoLeidas(0)
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })))
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="w-full h-16 sticky top-0 z-40 bg-white/40 dark:bg-slate-950/40 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/40 flex items-center justify-between px-6 transition-all duration-300">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden glass-btn-secondary p-2"
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight font-sans truncate">
          {obtenerTitulo(location.pathname)}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/60 hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer relative"
          aria-label={dark ? 'Activar modo claro' : 'Activar modo oscuro'}
        >
          <span className={`inline-block transition-transform duration-300 ${dark ? 'rotate-0' : 'rotate-180'}`}>
            <Moon size={18} />
          </span>
        </button>

        <div ref={panelRef} className="relative">
          <button
            onClick={() => setPanelOpen((v) => !v)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/60 hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer relative"
            aria-label="Notificaciones"
          >
            <Bell size={18} />
            {noLeidas > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {noLeidas > 9 ? '9+' : noLeidas}
              </span>
            )}
          </button>

          {panelOpen && (
            <NotificationsPanel
              notificaciones={notificaciones}
              loading={loadingNotif}
              onMarcarLeida={handleMarcarLeida}
              onMarcarTodasLeidas={handleMarcarTodasLeidas}
              onClose={() => setPanelOpen(false)}
            />
          )}
        </div>

        <div className="flex items-center gap-3 pl-3 border-l border-slate-200/60 dark:border-slate-800/60 hover:opacity-90 transition-opacity cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white text-sm font-semibold">
            {user?.nombre?.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight">
              {user?.nombre}
            </p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 capitalize">{user?.rol}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/60 hover:text-red-600 dark:hover:text-red-400 transition-all cursor-pointer"
          aria-label="Cerrar sesión"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
