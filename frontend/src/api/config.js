import api from './axios'

export const configApi = {
  getPerfil: () => api.get('/config/perfil'),
  updatePerfil: (data) => api.put('/config/perfil', data),
  updatePassword: (data) => api.put('/config/password', data),
}
