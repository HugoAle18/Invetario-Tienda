import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Tags,
  Truck,
  ArrowUpDown,
  Users,
  BarChart3,
  Settings,
  ArrowDownToLine,
  ArrowUpFromLine,
  X,
} from 'lucide-react'

const adminNav = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/productos', icon: Package, label: 'Productos' },
  { to: '/admin/categorias', icon: Tags, label: 'Categorías' },
  { to: '/admin/proveedores', icon: Truck, label: 'Proveedores' },
  { to: '/admin/movimientos', icon: ArrowUpDown, label: 'Movimientos' },
  { to: '/admin/usuarios', icon: Users, label: 'Usuarios' },
  { to: '/admin/reportes', icon: BarChart3, label: 'Reportes' },
  { to: '/admin/configuracion', icon: Settings, label: 'Configuración' },
]

const empleadoNav = [
  { to: '/empleado/panel', icon: LayoutDashboard, label: 'Panel' },
  { to: '/empleado/stock', icon: Package, label: 'Stock' },
  { to: '/empleado/entrada', icon: ArrowDownToLine, label: 'Entrada' },
  { to: '/empleado/salida', icon: ArrowUpFromLine, label: 'Salida' },
  { to: '/empleado/movimientos', icon: ArrowUpDown, label: 'Movimientos' },
]

export default function Sidebar({ open, onClose, role }) {
  const location = useLocation()
  const navItems = role === 'administrador' ? adminNav : empleadoNav

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-white/40 dark:bg-slate-950/40 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-800/40 flex flex-col justify-between p-4 transition-all duration-300 shadow-sm
          ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="flex items-center justify-between h-16 border-b border-slate-200/50 dark:border-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
              <Package size={18} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg text-gray-900 dark:text-white">INVENTEX</span>
          </div>
          <button onClick={onClose} className="md:hidden glass-btn-secondary p-1.5">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname.startsWith(item.to)
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all
                  ${isActive
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20 dark:bg-blue-500'
                    : 'text-slate-700 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-900/60 hover:text-blue-600 dark:hover:text-white'
                  }
                `}
              >
                <Icon size={18} className={`${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800/40 text-xs text-slate-500 dark:text-slate-400 text-center">
          INVENTEX v1.0
        </div>
      </aside>
    </>
  )
}
