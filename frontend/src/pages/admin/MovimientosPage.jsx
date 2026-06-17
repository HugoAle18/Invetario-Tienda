import { useState, useEffect, useCallback } from 'react'
import { movimientosApi } from '@/api/movimientos'
import MovementForm from '@/components/ui/MovementForm'
import Modal from '@/components/ui/Modal'
import toast from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'
import { crearNotificacionAutomatica } from '@/services/notificationService'
import {
  ArrowUpDown,
  Plus,
  Loader2,
  AlertCircle,
  RefreshCw,
  ArrowDownToLine,
  ArrowUpFromLine,
} from 'lucide-react'

export default function MovimientosPage() {
  const { user } = useAuth()
  const [movimientos, setMovimientos] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [tipoFiltro, setTipoFiltro] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [movementType, setMovementType] = useState('entrada')
  const [submitting, setSubmitting] = useState(false)
  const limit = 20

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, limit }
      if (tipoFiltro) params.tipo = tipoFiltro
      const { data } = await movimientosApi.listar(params)
      setMovimientos(data.data)
      setTotal(data.total)
    } catch {
      setError('Error al cargar movimientos')
    } finally {
      setLoading(false)
    }
  }, [page, tipoFiltro])

  useEffect(() => { fetch() }, [fetch])

  const openForm = (tipo) => {
    setMovementType(tipo)
    setModalOpen(true)
  }

  const handleSubmit = async (formData) => {
    setSubmitting(true)
    try {
      const payload = {
        producto_id: formData.producto_id,
        cantidad: formData.cantidad,
        motivo: formData.motivo,
      }
      if (movementType === 'entrada' && formData.precio_unitario) {
        payload.precio_unitario = formData.precio_unitario
      }

      if (movementType === 'entrada') {
        await movimientosApi.registrarEntrada(payload)
      } else {
        await movimientosApi.registrarSalida(payload)
      }

      toast.success(`${movementType === 'entrada' ? 'Entrada' : 'Salida'} registrada correctamente`)
      setModalOpen(false)
      fetch()
      crearNotificacionAutomatica({
        usuario_id: user.id,
        tipo: movementType === 'entrada' ? 'entrada' : 'salida',
        titulo: movementType === 'entrada' ? 'Entrada registrada' : 'Salida registrada',
        mensaje: `${movementType === 'entrada' ? 'Entrada' : 'Salida'} de ${formData.cantidad} unidades registrada`,
        referencia_tipo: 'movimiento',
      })
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al registrar movimiento'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ArrowUpDown size={22} className="text-brand" />
          <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">Movimientos</h2>
          {!loading && <span className="text-sm text-gray-500 dark:text-white/50 bg-gray-100 dark:bg-white/[0.06] px-2 py-0.5 rounded-full">{total}</span>}
        </div>
        <div className="flex gap-2">
          <button onClick={() => openForm('entrada')} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-extrabold text-sm px-4 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg">
            <ArrowDownToLine size={16} /> Entrada
          </button>
          <button onClick={() => openForm('salida')} className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 dark:bg-rose-500 dark:hover:bg-rose-600 text-white font-extrabold text-sm px-4 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg">
            <ArrowUpFromLine size={16} /> Salida
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="relative inline-block text-left">
        <select
          value={tipoFiltro}
          onChange={(e) => { setTipoFiltro(e.target.value); setPage(1) }}
          className="appearance-none bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-white text-sm rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer transition-colors hover:bg-slate-200 dark:hover:bg-slate-800"
        >
          <option value="" className="bg-white dark:bg-slate-950 text-slate-700 dark:text-white py-2">📦 Todos los movimientos</option>
          <option value="entrada" className="bg-white dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 py-2">🟩 Entradas</option>
          <option value="salida" className="bg-white dark:bg-slate-950 text-red-600 dark:text-red-400 py-2">🟥 Salidas</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
          </svg>
        </div>
      </div>

      {error && (
        <div className="flex flex-col items-center py-16 text-gray-600 dark:text-white/60">
          <AlertCircle size={40} className="text-danger mb-3" />
          <p className="text-base font-medium mb-2">{error}</p>
          <button onClick={fetch} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0">
            <RefreshCw size={16} /> Reintentar
          </button>
        </div>
      )}

      {loading && !error && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.06] rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {!loading && !error && movimientos.length === 0 && (
        <div className="flex flex-col items-center py-16 text-gray-400 dark:text-white/40">
          <ArrowUpDown size={48} className="mb-3" />
          <p className="text-base font-medium">No hay movimientos</p>
          <p className="text-sm mt-1">Registra una entrada o salida para empezar</p>
        </div>
      )}

      {!loading && !error && movimientos.length > 0 && (
        <>
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-md dark:shadow-xl mt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4 pl-6">Producto</th>
                    <th className="p-4 text-center">Tipo</th>
                    <th className="p-4 text-right">Cantidad</th>
                    <th className="p-4 hidden md:table-cell">Motivo</th>
                    <th className="p-4 hidden sm:table-cell">Usuario</th>
                    <th className="p-4 text-right pr-6 hidden lg:table-cell">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {movimientos.map((m) => (
                    <tr key={m.id} className="bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900/10 transition-colors">
                      <td className="p-4 pl-6 font-semibold text-slate-900 dark:text-white">{m.productos?.nombre}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          m.tipo === 'entrada'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                            : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
                        }`}>
                          {m.tipo === 'entrada' ? '📥 Entrada' : '📤 Salida'}
                        </span>
                      </td>
                      <td className={`p-4 text-right font-bold font-mono ${
                        m.tipo === 'entrada'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {m.tipo === 'entrada' ? `+${m.cantidad}` : `-${m.cantidad}`}
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-400 max-w-xs truncate hidden md:table-cell">{m.motivo}</td>
                      <td className="p-4 text-slate-500 dark:text-slate-400 text-xs font-medium hidden sm:table-cell">{m.usuarios?.nombre || 'Admin Principal'}</td>
                      <td className="p-4 text-right pr-6 font-mono text-xs text-slate-400 dark:text-slate-500 hidden lg:table-cell whitespace-nowrap">
                        {new Date(m.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-900 pt-4 w-full text-sm text-gray-600 dark:text-white/60">
              <span>Página {page} de {totalPages} ({total} registros)</span>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 rounded-lg transition-all shadow-sm border border-slate-200/50 dark:border-slate-800 disabled:opacity-40 disabled:hover:bg-slate-100 disabled:hover:text-slate-400">Anterior</button>
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 rounded-lg transition-all shadow-sm border border-slate-200/50 dark:border-slate-800 disabled:opacity-40 disabled:hover:bg-slate-100 disabled:hover:text-slate-400">Siguiente</button>
              </div>
            </div>
          )}
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={movementType === 'entrada' ? 'Registrar Entrada' : 'Registrar Salida'}>
        <MovementForm tipo={movementType} showPrecio={movementType === 'entrada' && user?.rol === 'administrador'} onSubmit={handleSubmit} loading={submitting} />
      </Modal>
    </div>
  )
}
