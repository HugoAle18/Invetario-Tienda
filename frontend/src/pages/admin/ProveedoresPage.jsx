import { useState, useEffect, useCallback } from 'react'
import { proveedoresApi } from '@/api/proveedores'
import ProveedorForm from './ProveedorForm'
import Modal from '@/components/ui/Modal'
import toast from 'react-hot-toast'
import { Truck, Plus, Pencil, Trash2, AlertCircle, RefreshCw, Phone, Mail, MapPin } from 'lucide-react'

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await proveedoresApi.listar()
      setProveedores(data)
    } catch {
      setError('Error al cargar proveedores')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const openCreate = () => { setEditing(null); setModalOpen(true) }
  const openEdit = (prov) => { setEditing(prov); setModalOpen(true) }

  const handleSubmit = async (data) => {
    setSubmitting(true)
    try {
      if (editing) {
        await proveedoresApi.actualizar(editing.id, data)
        toast.success('Proveedor actualizado')
      } else {
        await proveedoresApi.crear(data)
        toast.success('Proveedor creado')
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

  const handleDelete = async (prov) => {
    if (!confirm(`¿Eliminar "${prov.nombre}"?`)) return
    try {
      await proveedoresApi.eliminar(prov.id)
      toast.success('Proveedor eliminado')
      fetch()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al eliminar')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck size={22} className="text-brand" />
          <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">Proveedores</h2>
          {!loading && <span className="text-sm text-gray-500 dark:text-white/50 bg-gray-100 dark:bg-white/[0.06] px-2 py-0.5 rounded-full">{proveedores.length}</span>}
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 glass-btn text-sm">
          <Plus size={16} /> Nuevo Proveedor
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
            <div key={i} className="h-24 bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.06] rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {!loading && !error && proveedores.length === 0 && (
        <div className="flex flex-col items-center py-16 text-gray-400 dark:text-white/40">
          <Truck size={48} className="mb-3" />
          <p className="text-base font-medium">No hay proveedores</p>
          <p className="text-sm mt-1">Registra tu primer proveedor</p>
        </div>
      )}

      {!loading && !error && proveedores.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mx-auto">
          {proveedores.map((prov) => (
            <div key={prov.id} className="bg-white dark:bg-bg-secondary p-6 rounded-xl border border-gray-200 dark:border-bg-border shadow-sm flex flex-col justify-between gap-4 group hover:border-blue-500 dark:hover:border-blue-600 hover:shadow-md transition-all duration-300">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{prov.nombre}</h4>
                <div className="flex gap-1 shrink-0 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(prov)} className="p-1.5 rounded-lg text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/[0.05] hover:text-brand transition-colors" title="Editar">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => handleDelete(prov)} className="p-1.5 rounded-lg text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/[0.05] hover:text-danger transition-colors" title="Eliminar">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <div className="space-y-1 text-sm text-gray-500 dark:text-text-secondary">
                {prov.contacto && <p className="truncate"><span className="text-gray-400 dark:text-white/40">Contacto:</span> {prov.contacto}</p>}
                {prov.telefono && <p className="truncate flex items-center gap-1.5"><Phone size={13} /> {prov.telefono}</p>}
                {prov.email && <p className="truncate flex items-center gap-1.5"><Mail size={13} /> {prov.email}</p>}
                {prov.direccion && <p className="truncate flex items-center gap-1.5"><MapPin size={13} /> {prov.direccion}</p>}
              </div>
              {!prov.contacto && !prov.telefono && !prov.email && !prov.direccion && (
                <p className="text-xs text-gray-400 dark:text-white/40 italic mt-1">Sin datos de contacto</p>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null) }} title={editing ? 'Editar Proveedor' : 'Nuevo Proveedor'}>
        <ProveedorForm defaultValues={editing} onSubmit={handleSubmit} loading={submitting} />
      </Modal>
    </div>
  )
}
