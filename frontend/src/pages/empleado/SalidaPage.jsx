import { useState } from 'react'
import { movimientosApi } from '@/api/movimientos'
import MovementForm from '@/components/ui/MovementForm'
import toast from 'react-hot-toast'
import { ArrowUpFromLine, CheckCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { crearNotificacionAutomatica } from '@/services/notificationService'

export default function SalidaPage() {
  const { user } = useAuth()
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
      crearNotificacionAutomatica({
        usuario_id: user.id,
        tipo: 'salida',
        titulo: 'Salida registrada',
        mensaje: `Salida de ${data.cantidad} unidades registrada`,
        referencia_tipo: 'movimiento',
      })
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
      <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/50 rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-500 dark:hover:border-blue-600">
        {success ? (
          <div className="flex flex-col items-center py-8 text-gray-400 dark:text-white/40">
            <CheckCircle size={48} className="text-success mb-3" />
            <p className="text-base font-medium text-gray-900 dark:text-white">Salida registrada</p>
            <button
              onClick={() => setSuccess(false)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
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
