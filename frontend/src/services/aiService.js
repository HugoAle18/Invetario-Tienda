import api from '@/api/axios'

export async function consultarAgenteIA(mensaje) {
  try {
    const { data } = await api.post('/ai/consultar', { mensaje })
    return data.respuesta
  } catch (err) {
    const msg = err.response?.data?.error || 'Error al conectar con el agente IA'
    throw new Error(msg)
  }
}
