import { notificacionesApi } from '@/api/notificaciones'

function dispararRefresh() {
  window.dispatchEvent(new CustomEvent('notifications-refresh'))
}

export async function crearNotificacionAutomatica({ usuario_id, tipo, titulo, mensaje, referencia_tipo, referencia_id }) {
  try {
    await notificacionesApi.crear({ usuario_id, tipo, titulo, mensaje, referencia_tipo, referencia_id })
    dispararRefresh()
  } catch {
    // silent – no bloquear la accion principal
  }
}
