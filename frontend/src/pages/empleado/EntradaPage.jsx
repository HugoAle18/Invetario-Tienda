import { useState } from 'react'
import { movimientosApi } from '@/api/movimientos'
import MovementForm from '@/components/ui/MovementForm'
import toast from 'react-hot-toast'
import { ArrowDownToLine, CheckCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { crearNotificacionAutomatica } from '@/services/notificationService'

export default function EntradaPage() {
  const { user } = useAuth()
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
      crearNotificacionAutomatica({
        usuario_id: user.id,
        tipo: 'entrada',
        titulo: 'Entrada registrada',
        mensaje: `Entrada de ${data.cantidad} unidades registrada`,
        referencia_tipo: 'movimiento',
      })
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
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Registrar Entrada</h2>
      </div>
      <div className="bg-white dark:bg-bg-secondary border border-gray-200 dark:border-bg-border rounded-xl p-6 hover:border-blue-500 dark:hover:border-blue-600 hover:shadow-md transition-all duration-300">
        {success ? (
          <div className="flex flex-col items-center py-8 text-gray-400 dark:text-white/40">
            <CheckCircle size={48} className="text-success mb-3" />
            <p className="text-base font-medium text-gray-900 dark:text-white">Entrada registrada</p>
            <button
              onClick={() => setSuccess(false)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
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
