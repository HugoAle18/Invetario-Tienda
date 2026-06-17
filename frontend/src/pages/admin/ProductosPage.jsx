import { useState, useEffect, useCallback, useMemo } from 'react'
import { productosApi } from '@/api/productos'
import { categoriasApi } from '@/api/categorias'
import { proveedoresApi } from '@/api/proveedores'
import ProductoForm from './ProductoForm'
import Modal from '@/components/ui/Modal'
import toast from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'
import { crearNotificacionAutomatica } from '@/services/notificationService'
import {
  Package,
  Search,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  RefreshCw,
  Tags,
} from 'lucide-react'

export default function ProductosPage() {
  const { user } = useAuth()
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
        const { data: updated } = await productosApi.actualizar(editing.id, data)
        setProductos((prev) =>
          prev.map((p) => (p.id === editing.id ? { ...p, ...updated } : p))
        )
        toast.success('Producto actualizado')
      } else {
        const { data: created } = await productosApi.crear(data)
        toast.success('Producto creado')
        crearNotificacionAutomatica({
          usuario_id: user.id,
          tipo: 'sistema',
          titulo: 'Nuevo producto',
          mensaje: `Se creó el producto "${data.nombre || data.codigo}"`,
          referencia_tipo: 'producto',
        })
        setProductos((prev) => [...prev, created])
        setTotal((prev) => prev + 1)
      }
      setModalOpen(false)
      setEditing(null)
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

  const productosPorCategoria = useMemo(() => {
    return productos.reduce((acc, prod) => {
      const cat = prod.categoria || 'General'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(prod)
      return acc
    }, {})
  }, [productos])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Package size={22} className="text-brand" />
          <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">Productos</h2>
          {!loading && (
            <span className="text-sm text-gray-500 dark:text-white/50 bg-gray-100 dark:bg-white/[0.06] px-2 py-0.5 rounded-full">{total}</span>
          )}
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus size={16} />
          Nuevo Producto
        </button>
      </div>

      {/* Search & Filters */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código o nombre..."
            className="w-full pl-9 pr-3 py-2 bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.06] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:border-brand focus:ring-1 focus:ring-brand outline-none text-sm"
          />
        </div>
        <select
          value={categoriaFiltro}
          onChange={(e) => { setCategoriaFiltro(e.target.value); setPage(1) }}
          className="px-3 py-2 bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.06] rounded-lg text-gray-900 dark:text-white focus:border-brand focus:ring-1 focus:ring-brand outline-none text-sm"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
          ))}
        </select>
      </form>

      {/* Error */}
      {error && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-600 dark:text-white/60">
          <AlertCircle size={40} className="text-danger mb-3" />
          <p className="text-base font-medium mb-2">{error}</p>
          <button onClick={fetchProductos} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0">
            <RefreshCw size={16} />
            Reintentar
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && !error && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.06] rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && productos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-white/40">
          <Package size={48} className="mb-3" />
          <p className="text-base font-medium">No hay productos</p>
          <p className="text-sm mt-1">Crea tu primer producto para empezar</p>
        </div>
      )}

      {/* Grouped blocks by category */}
      {!loading && !error && productos.length > 0 && (
        <>
          {Object.entries(productosPorCategoria).map(([categoria, prods]) => (
            <div key={categoria} className="bg-[#111827]/40 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <div className="bg-slate-950 px-4 py-3 border-b border-slate-800">
                <h3 className="text-slate-200 font-semibold text-sm flex items-center gap-2">
                  <Tags size={14} className="text-brand" />
                  {categoria}
                  <span className="text-xs text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-full">{prods.length}</span>
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950/50 text-slate-500 text-xs uppercase font-semibold">
                    <tr>
                      <th className="p-3">Código</th>
                      <th className="p-3">Nombre</th>
                      <th className="p-3">Stock</th>
                      <th className="p-3">P. Venta</th>
                      <th className="p-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {prods.map((prod) => {
                      const stock = Number(prod.stock ?? prod.stock_actual ?? 0)
                      const stockBajo = stock <= 5
                      return (
                        <tr key={prod.codigo || prod.id} className="hover:bg-slate-800/20 transition-colors">
                          <td className="p-3 font-mono text-xs text-slate-400">{prod.codigo || prod.id}</td>
                          <td className="p-3 font-medium text-white">
                            <div className="flex flex-col gap-1">
                              {prod.nombre}
                              {stockBajo && (
                                <span className="w-fit text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full font-bold">
                                  Stock bajo
                                </span>
                              )}
                            </div>
                          </td>
                          <td className={`p-3 font-bold ${stockBajo ? 'text-red-500' : 'text-slate-300'}`}>{stock}</td>
                          <td className="p-3 font-medium">S/ {Number(prod.precio_venta || prod.precio || 0).toFixed(2)}</td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => openEdit(prod)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer mx-1.5"
                              title="Editar"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(prod)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer mx-1.5"
                              title="Eliminar"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-900 pt-4 w-full text-sm text-gray-600 dark:text-white/60">
              <span>
                Página {page} de {totalPages} ({total} registros)
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 rounded-lg transition-all shadow-sm border border-slate-200/50 dark:border-slate-800 disabled:opacity-40 disabled:hover:bg-slate-100 disabled:hover:text-slate-400"
                >
                  Anterior
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 rounded-lg transition-all shadow-sm border border-slate-200/50 dark:border-slate-800 disabled:opacity-40 disabled:hover:bg-slate-100 disabled:hover:text-slate-400"
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

