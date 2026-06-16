import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
})

let accessToken = null

export function setAccessToken(token) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const { getRefreshToken, setRefreshToken, removeRefreshToken } = await import('@/utils/token')
        const { authApi } = await import('@/api/auth')

        const refresh = getRefreshToken()
        if (!refresh) throw new Error('No refresh token')

        const { data } = await authApi.refresh(refresh)
        setAccessToken(data.accessToken)
        setRefreshToken(data.refreshToken)
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        return api(originalRequest)
      } catch {
        const { removeRefreshToken } = await import('@/utils/token')
        removeRefreshToken()
        setAccessToken(null)
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  }
)

export default api
