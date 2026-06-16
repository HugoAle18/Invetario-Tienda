import api from './axios'

export const proveedoresApi = {
  listar: () => api.get('/proveedores'),
  obtener: (id) => api.get(`/proveedores/${id}`),
  crear: (data) => api.post('/proveedores', data),
  actualizar: (id, data) => api.put(`/proveedores/${id}`, data),
  eliminar: (id) => api.delete(`/proveedores/${id}`),
}
