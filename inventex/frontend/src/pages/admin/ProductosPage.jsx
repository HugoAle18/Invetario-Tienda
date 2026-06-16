import { useState, useEffect, useCallback } from 'react'
import { productosApi } from '@/api/productos'
import { categoriasApi } from '@/api/categorias'
import { proveedoresApi } from '@/api/proveedores'
import ProductoForm from './ProductoForm'
import Modal from '@/components/ui/Modal'
import toast from 'react-hot-toast'
import {
  Package,
  Search,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'

export default function ProductosPage() {
  const [productos, setProductos] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('')
  const [categorias, setCategorias] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const limit = 20

  const fetchProductos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, limit, search: search || undefined }
      if (categoriaFiltro) params.categoria_id = categoriaFiltro
      const { data } = await productosApi.listar(params)
      setProductos(data.data)
      setTotal(data.total)
    } catch {
      setError('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }, [page, search, categoriaFiltro])

  const fetchOptions = useCallback(async () => {
    try {
      const [catRes, provRes] = await Promise.all([
        categoriasApi.listar(),
        proveedoresApi.listar(),
      ])
      setCategorias(catRes.data)
      setProveedores(provRes.data)
    } catch {
      // silently fail, form will just not have options
    }
  }, [])

  useEffect(() => {
    fetchProductos()
  }, [fetchProductos])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchProductos()
  }

  const openCreate = async () => {
    await fetchOptions()
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = async (producto) => {
    await fetchOptions()
    setEditing(producto)
    setModalOpen(true)
  }

  const handleSubmit = async (data) => {
    setSubmitting(true)
    try {
      if (editing) {
        await productosApi.actualizar(editing.id, data)
        toast.success('Producto actualizado')
      } else {
        await productosApi.crear(data)
        toast.success('Producto creado')
      }
      setModalOpen(false)
      setEditing(null)
      fetchProductos()
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al guardar producto'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (producto) => {
    if (!confirm(`¿Eliminar "${producto.nombre}"?`)) return
    try {
      await productosApi.eliminar(producto.id)
      toast.success('Producto eliminado')
      fetchProductos()
    } catch {
      toast.error('Error al eliminar producto')
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Package size={22} className="text-brand" />
          <h2 className="text-xl font-display font-bold text-white">Productos</h2>
          {!loading && (
            <span className="text-sm text-white/50 bg-white/[0.06] px-2 py-0.5 rounded-full">{total}</span>
          )}
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 glass-btn text-sm"
        >
          <Plus size={16} />
          Nuevo Producto
        </button>
      </div>

      {/* Search & Filters */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código o nombre..."
            className="w-full pl-9 pr-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-lg text-white placeholder-white/30 focus:border-brand focus:ring-1 focus:ring-brand outline-none text-sm"
          />
        </div>
        <select
          value={categoriaFiltro}
          onChange={(e) => { setCategoriaFiltro(e.target.value); setPage(1) }}
          className="px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-lg text-white focus:border-brand focus:ring-1 focus:ring-brand outline-none text-sm"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
          ))}
        </select>
      </form>

      {/* Error */}
      {error && (
        <div className="flex flex-col items-center justify-center py-16 text-white/60">
          <AlertCircle size={40} className="text-danger mb-3" />
          <p className="text-base font-medium mb-2">{error}</p>
          <button onClick={fetchProductos} className="flex items-center gap-2 px-4 py-2 glass-btn text-sm">
            <RefreshCw size={16} />
            Reintentar
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && !error && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 bg-white/[0.04] border border-white/[0.06] rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && productos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-white/40">
          <Package size={48} className="mb-3" />
          <p className="text-base font-medium">No hay productos</p>
          <p className="text-sm mt-1">Crea tu primer producto para empezar</p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && productos.length > 0 && (
        <>
          <div className="overflow-x-auto glass-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-white/60 label-mono">
                  <th className="text-left py-3 px-4 font-medium">Código</th>
                  <th className="text-left py-3 px-4 font-medium">Nombre</th>
                  <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Categoría</th>
                  <th className="text-right py-3 px-4 font-medium">Stock</th>
                  <th className="text-right py-3 px-4 font-medium hidden sm:table-cell">P. Venta</th>
                  <th className="text-right py-3 px-4 font-medium">Acciones</th>
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
                    <td className="py-3 px-4 text-white/60 hidden md:table-cell">
                      {p.categorias?.nombre || '—'}
                    </td>
                    <td className={`py-3 px-4 text-right font-semibold ${
                      p.stock_actual <= p.stock_minimo ? 'text-danger' : 'text-white'
                    }`}>
                      {p.stock_actual}
                    </td>
                    <td className="py-3 px-4 text-right text-white hidden sm:table-cell">
                      ${Number(p.precio_venta).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 rounded-lg text-white/60 hover:bg-white/[0.05] hover:text-brand transition-colors"
                          title="Editar"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          className="p-1.5 rounded-lg text-white/60 hover:bg-white/[0.05] hover:text-danger transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-white/60">
              <span>
                Página {page} de {totalPages} ({total} registros)
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 glass-btn-secondary disabled:opacity-40"
                >
                  Anterior
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 glass-btn-secondary disabled:opacity-40"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        title={editing ? 'Editar Producto' : 'Nuevo Producto'}
      >
        <ProductoForm
          defaultValues={editing}
          categorias={categorias}
          proveedores={proveedores}
          onSubmit={handleSubmit}
          loading={submitting}
        />
      </Modal>
    </div>
  )
}
