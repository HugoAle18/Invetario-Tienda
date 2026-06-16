import { useState, useEffect, useCallback } from 'react'
import { movimientosApi } from '@/api/movimientos'
import MovementForm from '@/components/ui/MovementForm'
import Modal from '@/components/ui/Modal'
import toast from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'
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
          <h2 className="text-xl font-display font-bold text-text-primary">Movimientos</h2>
          {!loading && <span className="text-sm text-text-muted bg-bg-hover px-2 py-0.5 rounded-full">{total}</span>}
        </div>
        <div className="flex gap-2">
          <button onClick={() => openForm('entrada')} className="flex items-center gap-2 px-4 py-2 bg-success hover:bg-success/80 text-white text-sm font-medium rounded-lg transition-colors">
            <ArrowDownToLine size={16} /> Entrada
          </button>
          <button onClick={() => openForm('salida')} className="flex items-center gap-2 px-4 py-2 bg-danger hover:bg-danger/80 text-white text-sm font-medium rounded-lg transition-colors">
            <ArrowUpFromLine size={16} /> Salida
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select
          value={tipoFiltro}
          onChange={(e) => { setTipoFiltro(e.target.value); setPage(1) }}
          className="px-3 py-2 bg-bg-card border border-bg-border rounded-lg text-text-primary focus:border-brand focus:ring-1 focus:ring-brand outline-none text-sm"
        >
          <option value="">Todos</option>
          <option value="entrada">Entradas</option>
          <option value="salida">Salidas</option>
        </select>
      </div>

      {error && (
        <div className="flex flex-col items-center py-16 text-text-secondary">
          <AlertCircle size={40} className="text-danger mb-3" />
          <p className="text-base font-medium mb-2">{error}</p>
          <button onClick={fetch} className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-hover text-white rounded-lg text-sm">
            <RefreshCw size={16} /> Reintentar
          </button>
        </div>
      )}

      {loading && !error && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 bg-bg-card border border-bg-border rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {!loading && !error && movimientos.length === 0 && (
        <div className="flex flex-col items-center py-16 text-text-muted">
          <ArrowUpDown size={48} className="mb-3" />
          <p className="text-base font-medium">No hay movimientos</p>
          <p className="text-sm mt-1">Registra una entrada o salida para empezar</p>
        </div>
      )}

      {!loading && !error && movimientos.length > 0 && (
        <>
          <div className="overflow-x-auto bg-bg-card border border-bg-border rounded-xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-bg-border text-text-secondary text-xs uppercase tracking-wider">
                  <th className="text-left py-3 px-4 font-medium">Producto</th>
                  <th className="text-left py-3 px-4 font-medium">Tipo</th>
                  <th className="text-right py-3 px-4 font-medium">Cantidad</th>
                  <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Motivo</th>
                  <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">Usuario</th>
                  <th className="text-right py-3 px-4 font-medium hidden lg:table-cell">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map((m) => (
                  <tr key={m.id} className="border-b border-bg-border hover:bg-bg-hover transition-colors">
                    <td className="py-3 px-4 text-text-primary font-medium">{m.productos?.nombre}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${m.tipo === 'entrada' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                        {m.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-text-primary">{m.cantidad}</td>
                    <td className="py-3 px-4 text-text-secondary hidden md:table-cell max-w-[200px] truncate">{m.motivo}</td>
                    <td className="py-3 px-4 text-text-secondary hidden sm:table-cell">{m.usuarios?.nombre}</td>
                    <td className="py-3 px-4 text-text-secondary text-right hidden lg:table-cell whitespace-nowrap">
                      {new Date(m.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-text-secondary">
              <span>Página {page} de {totalPages} ({total} registros)</span>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 bg-bg-card border border-bg-border rounded-lg disabled:opacity-40 hover:bg-bg-hover transition-colors">Anterior</button>
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 bg-bg-card border border-bg-border rounded-lg disabled:opacity-40 hover:bg-bg-hover transition-colors">Siguiente</button>
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
