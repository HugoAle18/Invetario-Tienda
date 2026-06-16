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
          <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">Usuarios</h2>
          {!loading && <span className="text-sm text-gray-500 dark:text-white/50 bg-gray-100 dark:bg-white/[0.06] px-2 py-0.5 rounded-full">{total}</span>}
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0">
          <Plus size={16} /> Nuevo Usuario
        </button>
      </div>

      <form onSubmit={handleSearch}>
        <div className="relative max-w-sm">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre o email..." className="w-full px-3 py-2 bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.06] rounded-lg text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-white/30 focus:border-brand focus:ring-1 focus:ring-brand outline-none text-sm" />
        </div>
      </form>

      {error && (
        <div className="flex flex-col items-center py-16 text-gray-600 dark:text-white/60">
          <AlertCircle size={40} className="text-danger mb-3" />
          <p className="text-base font-medium mb-2">{error}</p>
          <button onClick={fetch} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0">
            <RefreshCw size={16} /> Reintentar
          </button>
        </div>
      )}

      {loading && !error && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.06] rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {!loading && !error && usuarios.length === 0 && (
        <div className="flex flex-col items-center py-16 text-gray-400 dark:text-white/40">
          <Users size={48} className="mb-3" />
          <p className="text-base font-medium">No hay usuarios</p>
          <p className="text-sm mt-1">Crea el primer usuario del sistema</p>
        </div>
      )}

      {!loading && !error && usuarios.length > 0 && (
        <>
          <div className="w-full bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/50 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md mb-10 flex flex-col justify-between overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-300">
                  <th className="text-left py-3 px-4 font-bold">Nombre</th>
                  <th className="text-left py-3 px-4 font-bold">Email</th>
                  <th className="text-left py-3 px-4 font-bold">Rol</th>
                  <th className="text-left py-3 px-4 font-bold">Estado</th>
                  <th className="text-right py-3 px-4 font-bold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100 dark:border-slate-800 last:border-0 hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{u.nombre}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-white/60">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.rol === 'administrador' ? 'bg-violet-600 text-white shadow-sm' : 'bg-amber-600 text-white shadow-sm'
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
                        <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/[0.05] hover:text-brand transition-colors" title="Editar">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleToggle(u)} className="p-1.5 rounded-lg text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/[0.05] hover:text-warning transition-colors" title={u.activo ? 'Desactivar' : 'Activar'}>
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
            <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-900 pt-4 w-full text-sm text-gray-600 dark:text-white/60">
              <span>Página {page} de {totalPages} ({total} registros)</span>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 rounded-lg transition-all shadow-sm border border-slate-200/50 dark:border-slate-800 disabled:opacity-40 disabled:hover:bg-slate-100 disabled:hover:text-slate-400">Anterior</button>
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 rounded-lg transition-all shadow-sm border border-slate-200/50 dark:border-slate-800 disabled:opacity-40 disabled:hover:bg-slate-100 disabled:hover:text-slate-400">Siguiente</button>
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
