import { useState, useEffect, useCallback } from 'react'
import { reportesApi } from '@/api/reportes'
import toast from 'react-hot-toast'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import {
  BarChart3, Loader2, AlertCircle, RefreshCw,
} from 'lucide-react'

const COLORS = ['#2563eb', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

function formatCurrency(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n)
}

function ChartCard({ title, children, className = '' }) {
  return (
    <div className={`glass-card ${className}`}>
      <h3 className="font-display font-semibold text-white mb-4">{title}</h3>
      {children}
    </div>
  )
}

function EmptyState({ icon: Icon, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-white/40">
      <Icon size={32} className="mb-2" />
      <p className="text-sm">{message}</p>
    </div>
  )
}

export default function ReportesPage() {
  const [cats, setCats] = useState([])
  const [movs, setMovs] = useState([])
  const [tops, setTops] = useState([])
  const [vals, setVals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [desde, setDesde] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d.toISOString().split('T')[0]
  })
  const [hasta, setHasta] = useState(() => new Date().toISOString().split('T')[0])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [catRes, movRes, topRes, valRes] = await Promise.all([
        reportesApi.productosPorCategoria(),
        reportesApi.movimientosPorPeriodo({ desde, hasta }),
        reportesApi.productosMasMovidos(10),
        reportesApi.valorInventario(),
      ])
      setCats(catRes.data || [])
      setMovs(movRes.data || [])
      setTops(topRes.data || [])
      setVals(valRes.data || [])
    } catch {
      setError('Error al cargar reportes')
    } finally {
      setLoading(false)
    }
  }, [desde, hasta])

  useEffect(() => { fetchAll() }, [fetchAll])

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-80 bg-white/[0.04] border border-white/[0.06] rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center py-20 text-white/60">
        <AlertCircle size={48} className="text-danger mb-4" />
        <p className="text-lg font-medium mb-2">{error}</p>
        <button onClick={fetchAll} className="flex items-center gap-2 px-4 py-2 glass-btn text-sm">
          <RefreshCw size={16} /> Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 size={22} className="text-brand" />
          <h2 className="text-xl font-display font-bold text-white">Reportes</h2>
        </div>
      </div>

      {/* Date range for movements */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-xl p-4">
        <span className="text-sm text-white/60 font-medium">Rango de movimientos:</span>
        <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)}
          className="px-3 py-1.5 glass-input text-sm" />
        <span className="text-white/40 text-sm">a</span>
        <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)}
          className="px-3 py-1.5 glass-input text-sm" />
        <button onClick={fetchAll} className="px-4 py-1.5 glass-btn text-sm">
          Actualizar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products by category - Pie */}
        <ChartCard title="Productos por Categoría">
          {cats.length === 0 ? (
            <EmptyState icon={BarChart3} message="Sin datos de categorías" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={cats} dataKey="total" nameKey="nombre" cx="50%" cy="50%" outerRadius={90} label={({ nombre, total }) => `${nombre} (${total})`}>
                  {cats.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1c2333', border: '1px solid #30363d', borderRadius: '8px', color: '#e6edf3' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Movements over time - Bar */}
        <ChartCard title="Movimientos por Día">
          {movs.length === 0 ? (
            <EmptyState icon={BarChart3} message="Sin movimientos en el período" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={movs}>
                <XAxis dataKey="fecha" tick={{ fill: '#8b949e', fontSize: 11 }} tickFormatter={(v) => v?.slice(5) || ''} />
                <YAxis tick={{ fill: '#8b949e', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1c2333', border: '1px solid #30363d', borderRadius: '8px', color: '#e6edf3' }} />
                <Bar dataKey="entrada" name="Entradas" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="salida" name="Salidas" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Top products - Horizontal Bar */}
        <ChartCard title="Productos más Movidos">
          {tops.length === 0 ? (
            <EmptyState icon={BarChart3} message="Sin movimientos registrados" />
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {tops.map((item, i) => (
                <div key={item.nombre} className="flex items-center gap-3">
                  <span className="text-xs text-white/40 w-5 text-right shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white truncate">{item.nombre}</span>
                      <span className="text-xs text-white/60 shrink-0 ml-2">{item.total_movimientos} mov.</span>
                    </div>
                    <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-brand"
                        style={{ width: `${(item.total_movimientos / Math.max(...tops.map(t => t.total_movimientos))) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ChartCard>

        {/* Inventory value by category */}
        <ChartCard title="Valor de Inventario por Categoría">
          {vals.length === 0 ? (
            <EmptyState icon={BarChart3} message="Sin datos de inventario" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={vals} layout="vertical">
                <XAxis type="number" tick={{ fill: '#8b949e', fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <YAxis dataKey="nombre" type="category" tick={{ fill: '#8b949e', fontSize: 11 }} width={100} />
                <Tooltip contentStyle={{ backgroundColor: '#1c2333', border: '1px solid #30363d', borderRadius: '8px', color: '#e6edf3' }} formatter={(v) => formatCurrency(v)} />
                <Bar dataKey="valor_compra" name="Valor compra" fill="#2563eb" radius={[0, 4, 4, 0]} />
                <Bar dataKey="valor_venta" name="Valor venta" fill="#93c5fd" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Inventory value table */}
      {vals.length > 0 && (
        <div className="glass-card">
          <h3 className="font-display font-semibold text-white mb-4">Desglose por Categoría</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-white/60 label-mono">
                  <th className="text-left py-3 px-3 font-medium">Categoría</th>
                  <th className="text-right py-3 px-3 font-medium">Productos</th>
                  <th className="text-right py-3 px-3 font-medium">Stock total</th>
                  <th className="text-right py-3 px-3 font-medium">Valor compra</th>
                  <th className="text-right py-3 px-3 font-medium">Valor venta</th>
                </tr>
              </thead>
              <tbody>
                {vals.map((c) => (
                  <tr key={c.nombre} className="border-b border-white/[0.06] hover:bg-white/[0.05] transition-colors">
                    <td className="py-3 px-3 text-white font-medium">{c.nombre}</td>
                    <td className="py-3 px-3 text-right text-white/60">{c.productos}</td>
                    <td className="py-3 px-3 text-right text-white/60">{c.total_stock}</td>
                    <td className="py-3 px-3 text-right text-white font-mono">{formatCurrency(c.valor_compra)}</td>
                    <td className="py-3 px-3 text-right text-white font-mono">{formatCurrency(c.valor_venta)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
