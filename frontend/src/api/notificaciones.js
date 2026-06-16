import api from './axios'

export const notificacionesApi = {
  listar: (params = {}) => api.get('/notificaciones', { params }),
  obtenerNoLeidas: () => api.get('/notificaciones/no-leidas'),
  contarNoLeidas: () => api.get('/notificaciones/contar'),
  crear: (data) => api.post('/notificaciones', data),
  marcarLeida: (id) => api.put(`/notificaciones/${id}/leer`),
  marcarTodasLeidas: () => api.put('/notificaciones/leer-todas'),
}
