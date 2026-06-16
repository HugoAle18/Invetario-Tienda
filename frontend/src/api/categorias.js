import api from './axios'

export const categoriasApi = {
  listar: () => api.get('/categorias'),
  obtener: (id) => api.get(`/categorias/${id}`),
  crear: (data) => api.post('/categorias', data),
  actualizar: (id, data) => api.put(`/categorias/${id}`, data),
  eliminar: (id) => api.delete(`/categorias/${id}`),
}
