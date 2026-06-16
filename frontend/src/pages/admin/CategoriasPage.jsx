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
          <h2 className="text-xl font-display font-bold text-text-primary">Categorías</h2>
          {!loading && <span className="text-sm text-text-muted bg-bg-hover px-2 py-0.5 rounded-full">{categorias.length}</span>}
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-hover text-white text-sm font-medium rounded-lg transition-colors">
          <Plus size={16} /> Nueva Categoría
        </button>
      </div>

      {error && (
        <div className="flex flex-col items-center py-16 text-text-secondary">
          <AlertCircle size={40} className="text-danger mb-3" />
          <p className="text-base font-medium mb-2">{error}</p>
          <button onClick={fetch} className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-hover text-white rounded-lg text-sm">
            <RefreshCw size={16} /> Reintentar
          </button>
        </div>
      )}

      {loading && !error && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 bg-bg-card border border-bg-border rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {!loading && !error && categorias.length === 0 && (
        <div className="flex flex-col items-center py-16 text-text-muted">
          <Tags size={48} className="mb-3" />
          <p className="text-base font-medium">No hay categorías</p>
          <p className="text-sm mt-1">Crea tu primera categoría</p>
        </div>
      )}

      {!loading && !error && categorias.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categorias.map((cat) => (
            <div key={cat.id} className="bg-bg-card border border-bg-border rounded-xl p-4 hover:border-bg-hover transition-colors group">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <h4 className="text-text-primary font-medium truncate">{cat.nombre}</h4>
                  {cat.descripcion && (
                    <p className="text-text-secondary text-sm mt-1 line-clamp-2">{cat.descripcion}</p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg text-text-secondary hover:bg-bg-hover hover:text-brand transition-colors" title="Editar">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => handleDelete(cat)} className="p-1.5 rounded-lg text-text-secondary hover:bg-bg-hover hover:text-danger transition-colors" title="Eliminar">
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
