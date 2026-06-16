import { useState } from 'react'
import { Bell, CheckCheck, Loader2, Inbox } from 'lucide-react'

function formatearFechaRelativa(fecha) {
  const ahora = new Date()
  const notif = new Date(fecha)
  const diffMs = ahora - notif
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) return 'Ahora'
  if (diffMin < 60) return `Hace ${diffMin} min`
  const diffHoras = Math.floor(diffMs / 3600000)
  if (diffHoras < 24) return `Hace ${diffHoras}h`
  const diffDias = Math.floor(diffMs / 86400000)
  if (diffDias < 7) return `Hace ${diffDias}d`
  return notif.toLocaleDateString('es-PE', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

function obtenerColorBullet(tipo) {
  switch (tipo) {
    case 'entrada': return 'bg-emerald-500'
    case 'salida': return 'bg-red-500'
    case 'alerta': return 'bg-amber-500'
    case 'sistema': return 'bg-blue-500'
    default: return 'bg-gray-400'
  }
}

export default function NotificationsPanel({
  notificaciones = [],
  loading = false,
  onMarcarLeida,
  onMarcarTodasLeidas,
  onClose,
}) {
  const [marcandoId, setMarcandoId] = useState(null)

  const handleMarcarLeida = async (id) => {
    setMarcandoId(id)
    try {
      await onMarcarLeida(id)
    } finally {
      setMarcandoId(null)
    }
  }

  return (
    <div
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-bg-secondary border border-gray-200 dark:border-bg-border shadow-xl rounded-xl z-50 overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-bg-border">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Bell size={16} />
          Notificaciones
        </h3>
        <div className="flex items-center gap-2">
          {notificaciones.some((n) => !n.leida) && (
            <button
              onClick={onMarcarTodasLeidas}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <CheckCheck size={14} />
              Leer todas
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg leading-none"
          >
            ×
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={20} className="animate-spin text-gray-400" />
          </div>
        ) : notificaciones.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-gray-400 dark:text-text-muted">
            <Inbox size={32} className="mb-2" />
            <p className="text-sm">No hay notificaciones</p>
          </div>
        ) : (
          notificaciones.map((notif) => (
            <div
              key={notif.id}
              className={`flex gap-4 p-3.5 rounded-lg hover:bg-slate-50 dark:hover:bg-bg-hover transition-colors border-b border-gray-100 dark:border-bg-border cursor-pointer ${
                !notif.leida ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
              }`}
              onClick={() => !notif.leida && handleMarcarLeida(notif.id)}
            >
              <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${obtenerColorBullet(notif.tipo)}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {notif.titulo}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 line-clamp-2">
                  {notif.descripcion}
                </p>
                <p className="text-xs text-gray-400 dark:text-text-secondary flex items-center gap-1 mt-1">
                  {formatearFechaRelativa(notif.created_at)}
                  {marcandoId === notif.id && <Loader2 size={10} className="animate-spin inline" />}
                </p>
              </div>
              {!notif.leida && (
                <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
