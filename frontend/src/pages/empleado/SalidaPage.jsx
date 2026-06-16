import { useState } from 'react'
import { movimientosApi } from '@/api/movimientos'
import MovementForm from '@/components/ui/MovementForm'
import toast from 'react-hot-toast'
import { ArrowUpFromLine, CheckCircle } from 'lucide-react'

export default function SalidaPage() {
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (data) => {
    setSubmitting(true)
    setSuccess(false)
    try {
      await movimientosApi.registrarSalida({
        producto_id: data.producto_id,
        cantidad: data.cantidad,
        motivo: data.motivo,
      })
      toast.success('Salida registrada correctamente')
      setSuccess(true)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al registrar salida')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <ArrowUpFromLine size={22} className="text-danger" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Registrar Salida</h2>
      </div>
      <div className="bg-white dark:bg-bg-secondary border border-gray-200 dark:border-bg-border rounded-xl p-6">
        {success ? (
          <div className="flex flex-col items-center py-8 text-gray-400 dark:text-white/40">
            <CheckCircle size={48} className="text-success mb-3" />
            <p className="text-base font-medium text-gray-900 dark:text-white">Salida registrada</p>
            <button
              onClick={() => setSuccess(false)}
              className="mt-4 px-4 py-2 glass-btn text-sm"
            >
              Nueva salida
            </button>
          </div>
        ) : (
          <MovementForm tipo="salida" showPrecio={false} onSubmit={handleSubmit} loading={submitting} />
        )}
      </div>
    </div>
  )
}
