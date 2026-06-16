import { useState, useEffect } from 'react'
import { dashboardApi } from '@/api/dashboard'
import {
  Package,
  Tags,
  Truck,
  ArrowUpDown,
  Users,
  DollarSign,
  AlertTriangle,
  Loader2,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'

const kpiConfig = [
  { key: 'total_productos', icon: Package, label: 'Productos', color: 'bg-brand/10 text-brand' },
  { key: 'total_categorias', icon: Tags, label: 'Categorías', color: 'bg-success/10 text-success' },
  { key: 'total_proveedores', icon: Truck, label: 'Proveedores', color: 'bg-warning/10 text-warning' },
  { key: 'total_movimientos_30d', icon: ArrowUpDown, label: 'Movimientos (30d)', color: 'bg-brand/10 text-brand' },
  { key: 'total_usuarios', icon: Users, label: 'Usuarios', color: 'bg-success/10 text-success' },
  { key: 'valor_inventario', icon: DollarSign, label: 'Valor Inventario', color: 'bg-warning/10 text-warning' },
  { key: 'productos_bajo_stock', icon: AlertTriangle, label: 'Bajo Stock', color: 'bg-danger/10 text-danger' },
]

function formatCurrency(value) {
  const num = Number(value)
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(num)
}

function formatNumber(value) {
  return Number(value).toLocaleString('es-MX')
}

export default function DashboardPage() {
  const [kpis, setKpis] = useState(null)
  const [movimientos, setMovimientos] = useState([])
  const [alertas, setAlertas] = useState([])
  const [movimientosPorDia, setMovimientosPorDia] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [kpiRes, movRes, alertRes, diaRes] = await Promise.all([
        dashboardApi.admin(),
        dashboardApi.movimientosRecientes(10),
        dashboardApi.alertasStock(),
        dashboardApi.movimientosPorDia(15),
      ])
      setKpis(kpiRes.data)
      setMovimientos(movRes.data)
      setAlertas(alertRes.data)
      setMovimientosPorDia(diaRes.data)
    } catch (err) {
      setError('Error al cargar el dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-28 bg-gray-100 dark:bg-bg-hover border border-gray-200 dark:border-bg-border rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-600 dark:text-text-secondary">
        <AlertCircle size={48} className="text-danger mb-4" />
        <p className="text-lg font-medium mb-2">{error}</p>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold transition-all shadow-md hover:shadow-lg rounded-lg text-sm"
        >
          <RefreshCw size={16} />
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full max-w-6xl mx-auto">
        {kpiConfig.map(({ key, icon: Icon, label, color }) => {
          let value = kpis?.[key]
          if (value === undefined || value === null) return null

          if (key === 'valor_inventario') {
            value = formatCurrency(value)
          } else {
            value = formatNumber(value)
          }

          return (
            <div
              key={key}
              className="bg-white dark:bg-bg-secondary border border-gray-200 dark:border-bg-border rounded-xl glass-hover p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${color}`}>
                  <Icon size={20} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-text-primary font-display">{value}</p>
              <p className="text-sm text-gray-600 dark:text-text-secondary mt-1">{label}</p>
            </div>
          )
        })}
      </div>

      {/* Charts & Alerts — row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-6xl mx-auto mb-8 items-stretch">
        {/* Movimientos por día */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-950 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <h3 className="font-display font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
            <ArrowUpDown size={18} className="text-gray-700 dark:text-gray-300" />
            Movimientos por día
          </h3>
          {movimientosPorDia.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
              <ArrowUpDown size={32} className="mb-2 opacity-50" />
              <p className="text-sm">Sin movimientos en los últimos días</p>
            </div>
          ) : (
            <div className="space-y-3">
              {movimientosPorDia.slice(-10).map((dia) => {
                const total = dia.entrada + dia.salida || 1
                return (
                  <div key={dia.fecha} className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 w-24 shrink-0">
                      {dia.entrada > dia.salida ? (
                        <TrendingUp size={14} className="text-emerald-500" />
                      ) : (
                        <TrendingDown size={14} className="text-rose-500" />
                      )}
                      <span className="truncate">{dia.fecha}</span>
                    </div>
                    <div className="flex-1 flex gap-0.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden h-3 w-full">
                      {dia.entrada > 0 && (
                        <div
                          className="bg-emerald-500 dark:bg-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                          style={{ width: `${(dia.entrada / total) * 100}%` }}
                        />
                      )}
                      {dia.salida > 0 && (
                        <div
                          className="bg-rose-500 dark:bg-rose-600 shadow-[0_0_10px_rgba(244,63,94,0.2)]"
                          style={{ width: `${(dia.salida / total) * 100}%` }}
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold w-16 shrink-0 justify-end">
                      {dia.entrada > 0 && <span className="text-emerald-600 dark:text-emerald-400">+{dia.entrada}</span>}
                      {dia.salida > 0 && <span className="text-rose-600 dark:text-rose-400">-{dia.salida}</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Alertas de Stock */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-950 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col">
          <h3 className="font-display font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-500" />
            Alertas de Stock
          </h3>
          {alertas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
              <Package size={32} className="mb-2 opacity-50" />
              <p className="text-sm">Todo en orden</p>
              <p className="text-xs mt-1">No hay productos con stock bajo</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {alertas.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-red-50/60 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 transition-all hover:scale-[1.01]"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.nombre}</p>
                    <p className="text-xs text-red-600/80 dark:text-red-400 font-medium mt-0.5">{item.codigo}</p>
                  </div>
                  <div className="flex flex-col items-end justify-center px-3 py-1 bg-red-600 dark:bg-red-500 text-white rounded-lg font-bold text-sm shadow-sm ml-3">
                    <span>{item.stock_actual}</span>
                    <span className="text-[10px] text-white/80 font-medium">min: {item.stock_minimo}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Movimientos Recientes */}
      <div className="w-full max-w-6xl mx-auto bg-white dark:bg-slate-950 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <h3 className="font-display font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <ArrowUpDown size={18} className="text-gray-700 dark:text-gray-300" />
          Movimientos Recientes
        </h3>
        {movimientos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
            <ArrowUpDown size={32} className="mb-2 opacity-50" />
            <p className="text-sm">No hay movimientos registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-3 bg-slate-50 dark:bg-slate-900 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-slate-800">Producto</th>
                  <th className="px-4 py-3 bg-slate-50 dark:bg-slate-900 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-slate-800">Tipo</th>
                  <th className="px-4 py-3 bg-slate-50 dark:bg-slate-900 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-slate-800">Cantidad</th>
                  <th className="px-4 py-3 bg-slate-50 dark:bg-slate-900 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-slate-800 hidden md:table-cell">Motivo</th>
                  <th className="px-4 py-3 bg-slate-50 dark:bg-slate-900 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-slate-800 hidden sm:table-cell">Usuario</th>
                  <th className="px-4 py-3 bg-slate-50 dark:bg-slate-900 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-slate-800 hidden lg:table-cell">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map((mov) => (
                  <tr key={mov.id} className="border-b border-gray-100 dark:border-slate-900 last:border-0 hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3.5 text-sm font-semibold text-gray-900 dark:text-white">{mov.producto}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2.5 py-1 text-xs font-bold rounded-full text-white shadow-sm ${
                          mov.tipo === 'entrada'
                            ? 'bg-emerald-600 dark:bg-emerald-500'
                            : 'bg-rose-600 dark:bg-rose-500'
                        }`}
                      >
                        {mov.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-white">{mov.cantidad}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600 dark:text-gray-400 hidden md:table-cell max-w-[200px] truncate">{mov.motivo}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600 dark:text-gray-400 hidden sm:table-cell">{mov.usuario}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-500 dark:text-gray-500 text-right hidden lg:table-cell whitespace-nowrap">
                      {new Date(mov.created_at).toLocaleDateString('es-MX')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
