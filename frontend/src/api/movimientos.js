import api from './axios'

export const movimientosApi = {
  listar: (params) => api.get('/movimientos', { params }),
  registrarEntrada: (data) => api.post('/movimientos/entrada', data),
  registrarSalida: (data) => api.post('/movimientos/salida', data),
}
