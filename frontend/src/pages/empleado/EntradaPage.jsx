import { useState } from 'react'
import { movimientosApi } from '@/api/movimientos'
import MovementForm from '@/components/ui/MovementForm'
import toast from 'react-hot-toast'
import { ArrowDownToLine, CheckCircle } from 'lucide-react'

export default function EntradaPage() {
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (data) => {
    setSubmitting(true)
    setSuccess(false)
    try {
      await movimientosApi.registrarEntrada({
        producto_id: data.producto_id,
        cantidad: data.cantidad,
        motivo: data.motivo,
      })
      toast.success('Entrada registrada correctamente')
      setSuccess(true)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al registrar entrada')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <ArrowDownToLine size={22} className="text-success" />
        <h2 className="text-xl font-display font-bold text-text-primary">Registrar Entrada</h2>
      </div>
      <div className="bg-bg-card border border-bg-border rounded-xl p-5">
        {success ? (
          <div className="flex flex-col items-center py-8 text-text-muted">
            <CheckCircle size={48} className="text-success mb-3" />
            <p className="text-base font-medium text-text-primary">Entrada registrada</p>
            <button
              onClick={() => setSuccess(false)}
              className="mt-4 px-4 py-2 bg-brand hover:bg-brand-hover text-white text-sm font-medium rounded-lg transition-colors"
            >
              Nueva entrada
            </button>
          </div>
        ) : (
          <MovementForm tipo="entrada" showPrecio={false} onSubmit={handleSubmit} loading={submitting} />
        )}
      </div>
    </div>
  )
}
