import api from './axios'

export const empleadoApi = {
  panel: () => api.get('/empleado/panel'),
}
