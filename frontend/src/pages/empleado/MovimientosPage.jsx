import { useState, useEffect, useCallback } from 'react'
import { movimientosApi } from '@/api/movimientos'
import { ArrowUpDown, AlertCircle, RefreshCw, Loader2 } from 'lucide-react'

export default function EmpleadoMovimientosPage() {
  const [movimientos, setMovimientos] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const limit = 20

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await movimientosApi.listar({ page, limit })
      setMovimientos(data.data)
      setTotal(data.total)
    } catch {
      setError('Error al cargar movimientos')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { fetch() }, [fetch])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ArrowUpDown size={22} className="text-brand" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Mis Movimientos</h2>
        {!loading && <span className="text-sm text-gray-400 dark:text-white/40 bg-gray-100 dark:bg-white/[0.06] px-2 py-0.5 rounded-full text-gray-500 dark:text-white/50">{total}</span>}
      </div>

      {error && (
        <div className="flex flex-col items-center py-16 text-gray-600 dark:text-white/60">
          <AlertCircle size={40} className="text-danger mb-3" />
          <p className="text-base font-medium mb-2">{error}</p>
          <button onClick={fetch} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold transition-all shadow-md hover:shadow-lg rounded-lg text-sm">
            <RefreshCw size={16} /> Reintentar
          </button>
        </div>
      )}

      {loading && !error && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-gray-100 dark:bg-white/[0.04] rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {!loading && !error && movimientos.length === 0 && (
        <div className="flex flex-col items-center py-16 text-gray-400 dark:text-white/40">
          <ArrowUpDown size={48} className="mb-3 text-gray-400 dark:text-white/40" />
          <p className="text-base font-medium">Sin movimientos</p>
          <p className="text-sm mt-1">Aún no has registrado movimientos</p>
        </div>
      )}

      {!loading && !error && movimientos.length > 0 && (
        <>
          <div className="overflow-x-auto bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                  <th className="text-left py-3 px-4 font-medium text-blue-900 dark:text-text-primary font-bold">Producto</th>
                  <th className="text-left py-3 px-4 font-medium text-blue-900 dark:text-text-primary font-bold">Tipo</th>
                  <th className="text-right py-3 px-4 font-medium text-blue-900 dark:text-text-primary font-bold">Cantidad</th>
                  <th className="text-left py-3 px-4 font-medium text-blue-900 dark:text-text-primary font-bold hidden md:table-cell">Motivo</th>
                  <th className="text-right py-3 px-4 font-medium text-blue-900 dark:text-text-primary font-bold hidden lg:table-cell">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map((m) => (
                  <tr key={m.id} className="border-b border-gray-100 dark:border-slate-800 last:border-0 hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{m.productos?.nombre}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full text-white shadow-sm ${m.tipo === 'entrada' ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-rose-600 dark:bg-rose-500'}`}>
                        {m.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900 dark:text-white">{m.cantidad}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-white/60 hidden md:table-cell max-w-[200px] truncate">{m.motivo}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-white/60 text-right hidden lg:table-cell whitespace-nowrap">
                      {new Date(m.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-white/60">
              <span>Página {page} de {totalPages} ({total} registros)</span>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 glass-btn-secondary disabled:opacity-40">Anterior</button>
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 glass-btn-secondary disabled:opacity-40">Siguiente</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
