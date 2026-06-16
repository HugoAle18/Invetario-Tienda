import api from './axios'

export const usuariosApi = {
  listar: (params) => api.get('/usuarios', { params }),
  obtener: (id) => api.get(`/usuarios/${id}`),
  crear: (data) => api.post('/usuarios', data),
  actualizar: (id, data) => api.put(`/usuarios/${id}`, data),
  toggleActivo: (id) => api.patch(`/usuarios/${id}/toggle-activo`),
}
