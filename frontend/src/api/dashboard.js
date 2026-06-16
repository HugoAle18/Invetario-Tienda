import api from './axios'

export const dashboardApi = {
  admin: () => api.get('/dashboard/admin'),
  movimientosRecientes: (limite = 20) => api.get(`/dashboard/movimientos-recientes?limite=${limite}`),
  alertasStock: () => api.get('/dashboard/alertas-stock'),
  movimientosPorDia: (dias = 30) => api.get(`/dashboard/movimientos-por-dia?dias=${dias}`),
}
