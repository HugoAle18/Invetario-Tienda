import { useState, useEffect, useCallback } from 'react'
import { productosApi } from '@/api/productos'
import { categoriasApi } from '@/api/categorias'
import toast from 'react-hot-toast'
import {
  Package, Search, Loader2, AlertCircle, RefreshCw,
} from 'lucide-react'

export default function StockPage() {
  const [productos, setProductos] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('')
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const limit = 20

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, limit }
      if (search) params.search = search
      if (categoriaFiltro) params.categoria_id = categoriaFiltro
      const { data } = await productosApi.listar(params)
      setProductos(data.data)
      setTotal(data.total)
    } catch {
      setError('Error al cargar stock')
    } finally {
      setLoading(false)
    }
  }, [page, search, categoriaFiltro])

  useEffect(() => {
    categoriasApi.listar().then(({ data }) => setCategorias(data)).catch(() => {})
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const handleSearch = (e) => { e.preventDefault(); setPage(1) }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Package size={22} className="text-brand" />
        <h2 className="text-xl font-bold text-white">Stock</h2>
        {!loading && <span className="text-sm text-white/40 bg-white/[0.06] px-2 py-0.5 rounded-full text-white/50">{total}</span>}
      </div>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código o nombre..."
            className="w-full pl-9 pr-3 py-2 glass-input text-sm" />
        </div>
        <select value={categoriaFiltro} onChange={(e) => { setCategoriaFiltro(e.target.value); setPage(1) }}
          className="px-3 py-2 glass-input text-sm">
          <option value="">Todas las categorías</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
          ))}
        </select>
      </form>

      {error && (
        <div className="flex flex-col items-center py-16 text-white/60">
          <AlertCircle size={40} className="text-danger mb-3" />
          <p className="text-base font-medium mb-2">{error}</p>
          <button onClick={fetch} className="flex items-center gap-2 px-4 py-2 glass-btn text-sm">
            <RefreshCw size={16} /> Reintentar
          </button>
        </div>
      )}

      {loading && !error && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 bg-white/[0.04] rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {!loading && !error && productos.length === 0 && (
        <div className="flex flex-col items-center py-16 text-white/40">
          <Package size={48} className="mb-3" />
          <p className="text-base font-medium">Sin productos</p>
          <p className="text-sm mt-1">No hay productos disponibles para consultar</p>
        </div>
      )}

      {!loading && !error && productos.length > 0 && (
        <>
          <div className="overflow-x-auto glass">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] label-mono">
                  <th className="text-left py-3 px-4 font-medium">Código</th>
                  <th className="text-left py-3 px-4 font-medium">Nombre</th>
                  <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Categoría</th>
                  <th className="text-right py-3 px-4 font-medium">Stock</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((p) => (
                  <tr key={p.id} className="border-b border-white/[0.06] hover:bg-white/[0.05] transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-white/60">{p.codigo}</td>
                    <td className="py-3 px-4">
                      <p className="text-white font-medium">{p.nombre}</p>
                      {p.stock_actual <= p.stock_minimo && (
                        <span className="text-xs text-danger">Stock bajo</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-white/60 hidden md:table-cell">{p.categorias?.nombre || '—'}</td>
                    <td className={`py-3 px-4 text-right font-semibold ${p.stock_actual <= p.stock_minimo ? 'text-danger' : 'text-white'}`}>
                      {p.stock_actual}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-white/60">
              <span>Página {page} de {totalPages} ({total} registros)</span>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1.5 glass-btn-secondary disabled:opacity-40">Anterior</button>
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1.5 glass-btn-secondary disabled:opacity-40">Siguiente</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
