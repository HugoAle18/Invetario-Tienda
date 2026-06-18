import api from './axios.js'

export const marcelApi = {
  chat: async (mensaje) => {
    const { data } = await api.post('/marcel/chat', { mensaje })
    return data
  },
}
