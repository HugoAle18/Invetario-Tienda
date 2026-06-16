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
          <div key={i} className="h-28 bg-bg-card border border-bg-border rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
        <AlertCircle size={48} className="text-danger mb-4" />
        <p className="text-lg font-medium mb-2">{error}</p>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-hover text-white rounded-lg transition-colors text-sm"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
              className="bg-bg-card border border-bg-border rounded-xl p-4 hover:border-bg-hover transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${color}`}>
                  <Icon size={20} />
                </div>
              </div>
              <p className="text-2xl font-bold text-text-primary font-display">{value}</p>
              <p className="text-sm text-text-secondary mt-1">{label}</p>
            </div>
          )
        })}
      </div>

      {/* Charts & Recent movements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-bg-card border border-bg-border rounded-xl p-5">
          <h3 className="font-display font-semibold text-text-primary mb-4">Movimientos por día</h3>
          {movimientosPorDia.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-text-muted">
              <ArrowUpDown size={32} className="mb-2" />
              <p className="text-sm">Sin movimientos en los últimos días</p>
            </div>
          ) : (
            <div className="space-y-2">
              {movimientosPorDia.slice(-10).map((dia) => (
                <div key={dia.fecha} className="flex items-center gap-3">
                  <span className="text-xs text-text-secondary w-24 shrink-0">{dia.fecha}</span>
                  {dia.entrada > 0 && (
                    <div className="flex items-center gap-1 text-xs text-success">
                      <TrendingUp size={14} />
                      <span>{dia.entrada}</span>
                    </div>
                  )}
                  {dia.salida > 0 && (
                    <div className="flex items-center gap-1 text-xs text-danger">
                      <TrendingDown size={14} />
                      <span>{dia.salida}</span>
                    </div>
                  )}
                  <div className="flex-1 flex gap-0.5">
                    {dia.entrada > 0 && (
                      <div
                        className="h-3 rounded-l bg-success/60"
                        style={{ width: `${Math.min((dia.entrada / (dia.entrada + dia.salida || 1)) * 100, 100)}%` }}
                      />
                    )}
                    {dia.salida > 0 && (
                      <div
                        className="h-3 rounded-r bg-danger/60"
                        style={{ width: `${Math.min((dia.salida / (dia.entrada + dia.salida || 1)) * 100, 100)}%` }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low stock alerts */}
        <div className="bg-bg-card border border-bg-border rounded-xl p-5">
          <h3 className="font-display font-semibold text-text-primary mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-warning" />
            Alertas de Stock
          </h3>
          {alertas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-text-muted">
              <Package size={32} className="mb-2" />
              <p className="text-sm">Todo en orden</p>
              <p className="text-xs text-text-muted mt-1">No hay productos con stock bajo</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {alertas.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-bg-hover"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{item.nombre}</p>
                    <p className="text-xs text-text-muted">{item.codigo}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm font-semibold text-danger">{item.stock_actual}</p>
                    <p className="text-xs text-text-muted">min: {item.stock_minimo}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent movements */}
      <div className="bg-bg-card border border-bg-border rounded-xl p-5">
        <h3 className="font-display font-semibold text-text-primary mb-4">Movimientos Recientes</h3>
        {movimientos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-text-muted">
            <ArrowUpDown size={32} className="mb-2" />
            <p className="text-sm">No hay movimientos registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-bg-border text-text-secondary text-xs uppercase tracking-wider">
                  <th className="text-left py-3 px-2 font-medium">Producto</th>
                  <th className="text-left py-3 px-2 font-medium">Tipo</th>
                  <th className="text-right py-3 px-2 font-medium">Cantidad</th>
                  <th className="text-left py-3 px-2 font-medium hidden md:table-cell">Motivo</th>
                  <th className="text-left py-3 px-2 font-medium hidden sm:table-cell">Usuario</th>
                  <th className="text-right py-3 px-2 font-medium hidden lg:table-cell">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map((mov) => (
                  <tr key={mov.id} className="border-b border-bg-border hover:bg-bg-hover transition-colors">
                    <td className="py-3 px-2 text-text-primary font-medium">{mov.producto}</td>
                    <td className="py-3 px-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          mov.tipo === 'entrada'
                            ? 'bg-success/10 text-success'
                            : 'bg-danger/10 text-danger'
                        }`}
                      >
                        {mov.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right text-text-primary font-semibold">{mov.cantidad}</td>
                    <td className="py-3 px-2 text-text-secondary hidden md:table-cell max-w-[200px] truncate">{mov.motivo}</td>
                    <td className="py-3 px-2 text-text-secondary hidden sm:table-cell">{mov.usuario}</td>
                    <td className="py-3 px-2 text-text-secondary text-right hidden lg:table-cell whitespace-nowrap">
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
