import { useState, useEffect, useCallback } from 'react'
import { categoriasApi } from '@/api/categorias'
import CategoriaForm from './CategoriaForm'
import Modal from '@/components/ui/Modal'
import toast from 'react-hot-toast'
import { Tags, Plus, Pencil, Trash2, Loader2, AlertCircle, RefreshCw } from 'lucide-react'

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await categoriasApi.listar()
      setCategorias(data)
    } catch {
      setError('Error al cargar categorías')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const openCreate = () => { setEditing(null); setModalOpen(true) }
  const openEdit = (cat) => { setEditing(cat); setModalOpen(true) }

  const handleSubmit = async (data) => {
    setSubmitting(true)
    try {
      if (editing) {
        await categoriasApi.actualizar(editing.id, data)
        toast.success('Categoría actualizada')
      } else {
        await categoriasApi.crear(data)
        toast.success('Categoría creada')
      }
      setModalOpen(false)
      setEditing(null)
      fetch()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al guardar')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (cat) => {
    if (!confirm(`¿Eliminar "${cat.nombre}"?`)) return
    try {
      await categoriasApi.eliminar(cat.id)
      toast.success('Categoría eliminada')
      fetch()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al eliminar')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tags size={22} className="text-brand" />
          <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">Categorías</h2>
          {!loading && <span className="text-sm text-gray-500 dark:text-white/50 bg-gray-100 dark:bg-white/[0.06] px-2 py-0.5 rounded-full">{categorias.length}</span>}
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 glass-btn text-sm">
          <Plus size={16} /> Nueva Categoría
        </button>
      </div>

      {error && (
        <div className="flex flex-col items-center py-16 text-gray-600 dark:text-white/60">
          <AlertCircle size={40} className="text-danger mb-3" />
          <p className="text-base font-medium mb-2">{error}</p>
          <button onClick={fetch} className="flex items-center gap-2 px-4 py-2 glass-btn text-sm">
            <RefreshCw size={16} /> Reintentar
          </button>
        </div>
      )}

      {loading && !error && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.06] rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {!loading && !error && categorias.length === 0 && (
        <div className="flex flex-col items-center py-16 text-gray-400 dark:text-white/40">
          <Tags size={48} className="mb-3" />
          <p className="text-base font-medium">No hay categorías</p>
          <p className="text-sm mt-1">Crea tu primera categoría</p>
        </div>
      )}

      {!loading && !error && categorias.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categorias.map((cat) => (
            <div key={cat.id} className="bg-white dark:bg-bg-secondary border border-gray-200 dark:border-bg-border rounded-xl group">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <h4 className="text-gray-900 dark:text-white font-medium truncate">{cat.nombre}</h4>
                  {cat.descripcion && (
                    <p className="text-gray-600 dark:text-white/60 text-sm mt-1 line-clamp-2">{cat.descripcion}</p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/[0.05] hover:text-brand transition-colors" title="Editar">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => handleDelete(cat)} className="p-1.5 rounded-lg text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/[0.05] hover:text-danger transition-colors" title="Eliminar">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null) }} title={editing ? 'Editar Categoría' : 'Nueva Categoría'}>
        <CategoriaForm defaultValues={editing} onSubmit={handleSubmit} loading={submitting} />
      </Modal>
    </div>
  )
}
