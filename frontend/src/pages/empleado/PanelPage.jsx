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
            <div key={i} className="h-24 bg-bg-card border border-bg-border rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-bg-card border border-bg-border rounded-xl animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center py-20 text-text-secondary">
        <AlertCircle size={48} className="text-danger mb-4" />
        <p className="text-lg font-medium mb-2">{error}</p>
        <button onClick={fetch} className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-hover text-white rounded-lg text-sm">
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
        <h1 className="text-2xl font-display font-bold text-text-primary">
          Bienvenido, {user?.nombre}
        </h1>
        <p className="text-text-secondary mt-1">Panel de control de empleado</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-bg-card border border-bg-border rounded-xl p-4">
            <div className={`p-2 rounded-lg w-fit ${color} mb-3`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-bold text-text-primary font-display">{value}</p>
            <p className="text-sm text-text-secondary mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent movements */}
      <div className="bg-bg-card border border-bg-border rounded-xl p-5">
        <h3 className="font-display font-semibold text-text-primary mb-4">Movimientos Recientes</h3>
        {(!data?.movimientos_recientes || data.movimientos_recientes.length === 0) ? (
          <div className="flex flex-col items-center py-10 text-text-muted">
            <ArrowUpDown size={32} className="mb-2" />
            <p className="text-sm">No hay movimientos recientes</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-bg-border text-text-secondary text-xs uppercase tracking-wider">
                  <th className="text-left py-3 px-2 font-medium">Producto</th>
                  <th className="text-left py-3 px-2 font-medium">Tipo</th>
                  <th className="text-right py-3 px-2 font-medium">Cantidad</th>
                  <th className="text-left py-3 px-2 font-medium hidden sm:table-cell">Motivo</th>
                  <th className="text-left py-3 px-2 font-medium hidden sm:table-cell">Usuario</th>
                </tr>
              </thead>
              <tbody>
                {data.movimientos_recientes.map((m) => (
                  <tr key={m.id} className="border-b border-bg-border hover:bg-bg-hover transition-colors">
                    <td className="py-3 px-2 text-text-primary font-medium">{m.producto}</td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${m.tipo === 'entrada' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                        {m.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right font-semibold text-text-primary">{m.cantidad}</td>
                    <td className="py-3 px-2 text-text-secondary hidden sm:table-cell max-w-[200px] truncate">{m.motivo}</td>
                    <td className="py-3 px-2 text-text-secondary hidden sm:table-cell">{m.usuario}</td>
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
