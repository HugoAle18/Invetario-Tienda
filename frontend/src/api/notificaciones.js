import api from './axios'

export const notificacionesApi = {
  listar: (params = {}) => api.get('/notificaciones', { params }),
  obtenerNoLeidas: () => api.get('/notificaciones/no-leidas'),
  contarNoLeidas: () => api.get('/notificaciones/contar'),
  marcarLeida: (id) => api.put(`/notificaciones/${id}/leer`),
  marcarTodasLeidas: () => api.put('/notificaciones/leer-todas'),
}
