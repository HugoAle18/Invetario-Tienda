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
      <div className="flex gap-3">
        <select
          value={tipoFiltro}
          onChange={(e) => { setTipoFiltro(e.target.value); setPage(1) }}
          className="px-3 py-2 bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.06] rounded-lg text-gray-900 dark:text-white focus:border-brand focus:ring-1 focus:ring-brand outline-none text-sm"
        >
          <option value="">Todos</option>
          <option value="entrada">Entradas</option>
          <option value="salida">Salidas</option>
        </select>
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
          <div className="w-full bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/50 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md mb-10 flex flex-col justify-between overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-300">
                  <th className="text-left py-3 px-4 font-bold">Producto</th>
                  <th className="text-left py-3 px-4 font-bold">Tipo</th>
                  <th className="text-right py-3 px-4 font-bold">Cantidad</th>
                  <th className="text-left py-3 px-4 font-bold hidden md:table-cell">Motivo</th>
                  <th className="text-left py-3 px-4 font-bold hidden sm:table-cell">Usuario</th>
                  <th className="text-right py-3 px-4 font-bold hidden lg:table-cell">Fecha</th>
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
                    <td className="py-3 px-4 text-gray-600 dark:text-white/60 hidden sm:table-cell">{m.usuarios?.nombre}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-white/60 text-right hidden lg:table-cell whitespace-nowrap">
                      {new Date(m.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
