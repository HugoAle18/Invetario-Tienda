import api from './axios'

export const reportesApi = {
  productosPorCategoria: () => api.get('/reportes/productos-por-categoria'),
  movimientosPorPeriodo: (params) => api.get('/reportes/movimientos-por-periodo', { params }),
  productosMasMovidos: (limite = 10) => api.get(`/reportes/productos-mas-movidos?limite=${limite}`),
  valorInventario: () => api.get('/reportes/valor-inventario'),
}
