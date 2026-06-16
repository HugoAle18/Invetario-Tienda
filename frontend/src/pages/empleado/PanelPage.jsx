import { useState, useEffect, useCallback } from 'react'
import { empleadoApi } from '@/api/empleado'
import { useAuth } from '@/context/AuthContext'
import {
  LayoutDashboard, Package, AlertTriangle, ArrowUpDown,
  Loader2, AlertCircle, RefreshCw,
} from 'lucide-react'

export default function PanelPage() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: res } = await empleadoApi.panel()
      setData(res)
    } catch {
      setError('Error al cargar panel')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 dark:bg-white/[0.04] rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-gray-100 dark:bg-white/[0.04] rounded-xl animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center py-20 text-gray-600 dark:text-white/60">
        <AlertCircle size={48} className="text-danger mb-4" />
        <p className="text-lg font-medium mb-2">{error}</p>
        <button onClick={fetch} className="flex items-center gap-2 px-4 py-2 glass-btn text-sm">
          <RefreshCw size={16} /> Reintentar
        </button>
      </div>
    )
  }

  const kpis = [
    { icon: Package, label: 'Productos en sistema', value: data?.total_productos, color: 'bg-brand/10 text-brand' },
    { icon: AlertTriangle, label: 'Alertas de stock', value: data?.alertas_stock, color: 'bg-warning/10 text-warning' },
    { icon: ArrowUpDown, label: 'Mis movimientos', value: data?.mis_movimientos, color: 'bg-success/10 text-success' },
    { icon: LayoutDashboard, label: 'Movimientos hoy', value: data?.movimientos_hoy, color: 'bg-brand/10 text-brand' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Bienvenido, {user?.nombre}
        </h1>
        <p className="text-gray-600 dark:text-white/60 mt-1">Panel de control de empleado</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="glass p-4">
            <div className={`p-2 rounded-lg w-fit ${color} mb-3`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-sm text-gray-600 dark:text-white/60 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent movements */}
      <div className="bg-white dark:bg-bg-secondary border border-gray-200 dark:border-bg-border rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Movimientos Recientes</h3>
        {(!data?.movimientos_recientes || data.movimientos_recientes.length === 0) ? (
          <div className="flex flex-col items-center py-10 text-gray-400 dark:text-white/40">
            <ArrowUpDown size={32} className="mb-2" />
            <p className="text-sm">No hay movimientos recientes</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/[0.06] label-mono">
                  <th className="text-left py-3 px-2 font-medium">Producto</th>
                  <th className="text-left py-3 px-2 font-medium">Tipo</th>
                  <th className="text-right py-3 px-2 font-medium">Cantidad</th>
                  <th className="text-left py-3 px-2 font-medium hidden sm:table-cell">Motivo</th>
                  <th className="text-left py-3 px-2 font-medium hidden sm:table-cell">Usuario</th>
                </tr>
              </thead>
              <tbody>
                {data.movimientos_recientes.map((m) => (
                  <tr key={m.id} className="border-b border-gray-200 dark:border-white/[0.06] hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors">
                    <td className="py-3 px-2 text-gray-900 dark:text-white font-medium">{m.producto}</td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${m.tipo === 'entrada' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                        {m.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right font-semibold text-gray-900 dark:text-white">{m.cantidad}</td>
                    <td className="py-3 px-2 text-gray-600 dark:text-white/60 hidden sm:table-cell max-w-[200px] truncate">{m.motivo}</td>
                    <td className="py-3 px-2 text-gray-600 dark:text-white/60 hidden sm:table-cell">{m.usuario}</td>
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
