import { useState, useEffect, useCallback } from 'react'
import { usuariosApi } from '@/api/usuarios'
import UsuarioForm from './UsuarioForm'
import Modal from '@/components/ui/Modal'
import toast from 'react-hot-toast'
import {
  Users,
  Plus,
  Pencil,
  Loader2,
  AlertCircle,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const limit = 20

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, limit }
      if (search) params.search = search
      const { data } = await usuariosApi.listar(params)
      setUsuarios(data.data)
      setTotal(data.total)
    } catch {
      setError('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { fetch() }, [fetch])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetch()
  }

  const openCreate = () => { setEditing(null); setModalOpen(true) }
  const openEdit = (u) => { setEditing(u); setModalOpen(true) }

  const handleSubmit = async (data) => {
    setSubmitting(true)
    try {
      const payload = { ...data }
      if (!payload.password) delete payload.password

      if (editing) {
        await usuariosApi.actualizar(editing.id, payload)
        toast.success('Usuario actualizado')
      } else {
        await usuariosApi.crear(payload)
        toast.success('Usuario creado')
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

  const handleToggle = async (usuario) => {
    try {
      const { data } = await usuariosApi.toggleActivo(usuario.id)
      toast.success(`Usuario ${data.activo ? 'activado' : 'desactivado'}`)
      fetch()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al cambiar estado')
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users size={22} className="text-brand" />
          <h2 className="text-xl font-display font-bold text-text-primary">Usuarios</h2>
          {!loading && <span className="text-sm text-text-muted bg-bg-hover px-2 py-0.5 rounded-full">{total}</span>}
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-hover text-white text-sm font-medium rounded-lg transition-colors">
          <Plus size={16} /> Nuevo Usuario
        </button>
      </div>

      <form onSubmit={handleSearch}>
        <div className="relative max-w-sm">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre o email..." className="w-full px-3 py-2 bg-bg-card border border-bg-border rounded-lg text-text-primary placeholder-text-muted focus:border-brand focus:ring-1 focus:ring-brand outline-none text-sm" />
        </div>
      </form>

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
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-bg-card border border-bg-border rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {!loading && !error && usuarios.length === 0 && (
        <div className="flex flex-col items-center py-16 text-text-muted">
          <Users size={48} className="mb-3" />
          <p className="text-base font-medium">No hay usuarios</p>
          <p className="text-sm mt-1">Crea el primer usuario del sistema</p>
        </div>
      )}

      {!loading && !error && usuarios.length > 0 && (
        <>
          <div className="overflow-x-auto bg-bg-card border border-bg-border rounded-xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-bg-border text-text-secondary text-xs uppercase tracking-wider">
                  <th className="text-left py-3 px-4 font-medium">Nombre</th>
                  <th className="text-left py-3 px-4 font-medium">Email</th>
                  <th className="text-left py-3 px-4 font-medium">Rol</th>
                  <th className="text-left py-3 px-4 font-medium">Estado</th>
                  <th className="text-right py-3 px-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id} className="border-b border-bg-border hover:bg-bg-hover transition-colors">
                    <td className="py-3 px-4 text-text-primary font-medium">{u.nombre}</td>
                    <td className="py-3 px-4 text-text-secondary">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.rol === 'administrador' ? 'bg-brand/10 text-brand' : 'bg-bg-hover text-text-secondary'
                      }`}>
                        {u.rol === 'administrador' ? 'Admin' : 'Empleado'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${u.activo ? 'text-success' : 'text-danger'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.activo ? 'bg-success' : 'bg-danger'}`} />
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg text-text-secondary hover:bg-bg-hover hover:text-brand transition-colors" title="Editar">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleToggle(u)} className="p-1.5 rounded-lg text-text-secondary hover:bg-bg-hover hover:text-warning transition-colors" title={u.activo ? 'Desactivar' : 'Activar'}>
                          {u.activo ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-text-secondary">
              <span>Página {page} de {totalPages} ({total} registros)</span>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 bg-bg-card border border-bg-border rounded-lg disabled:opacity-40 hover:bg-bg-hover transition-colors">Anterior</button>
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 bg-bg-card border border-bg-border rounded-lg disabled:opacity-40 hover:bg-bg-hover transition-colors">Siguiente</button>
              </div>
            </div>
          )}
        </>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null) }} title={editing ? 'Editar Usuario' : 'Nuevo Usuario'}>
        <UsuarioForm defaultValues={editing} onSubmit={handleSubmit} loading={submitting} />
      </Modal>
    </div>
  )
}
