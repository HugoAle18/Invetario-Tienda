import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { configApi } from '@/api/config'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'
import { Settings, User, Lock, Loader2, AlertCircle, RefreshCw, Eye, EyeOff } from 'lucide-react'

const perfilSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
})

const passwordSchema = z.object({
  password_actual: z.string().min(1, 'Contraseña actual requerida'),
  password_nueva: z.string().min(6, 'Mínimo 6 caracteres'),
  password_confirmar: z.string().min(1, 'Confirma la contraseña'),
}).refine((d) => d.password_nueva === d.password_confirmar, {
  message: 'Las contraseñas no coinciden',
  path: ['password_confirmar'],
})

export default function ConfigPage() {
  const { user, setUser } = useAuth()
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [showPasswords, setShowPasswords] = useState({ actual: false, nueva: false, confirmar: false })

  const perfilForm = useForm({
    resolver: zodResolver(perfilSchema),
    defaultValues: { nombre: '', email: '' },
  })

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password_actual: '', password_nueva: '', password_confirmar: '' },
  })

  useEffect(() => {
    const load = async () => {
      setFetchLoading(true)
      setFetchError(null)
      try {
        const { data } = await configApi.getPerfil()
        perfilForm.reset({ nombre: data.nombre, email: data.email })
      } catch {
        setFetchError('Error al cargar perfil')
      } finally {
        setFetchLoading(false)
      }
    }
    load()
  }, [perfilForm])

  const handlePerfil = async (data) => {
    setProfileLoading(true)
    try {
      const res = await configApi.updatePerfil(data)
      setUser((prev) => ({ ...prev, nombre: res.data.nombre, email: res.data.email }))
      toast.success('Perfil actualizado')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al actualizar perfil')
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePassword = async (data) => {
    setPasswordLoading(true)
    try {
      await configApi.updatePassword({
        password_actual: data.password_actual,
        password_nueva: data.password_nueva,
      })
      toast.success('Contraseña actualizada')
      passwordForm.reset()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al cambiar contraseña')
    } finally {
      setPasswordLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="h-48 bg-white/[0.04] border border-white/[0.06] rounded-xl animate-pulse" />
        <div className="h-48 bg-white/[0.04] border border-white/[0.06] rounded-xl animate-pulse" />
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center py-20 text-white/60">
        <AlertCircle size={48} className="text-danger mb-4" />
        <p className="text-lg font-medium mb-2">{fetchError}</p>
        <button onClick={() => window.location.reload()} className="flex items-center gap-2 px-4 py-2 glass-btn text-sm">
          <RefreshCw size={16} /> Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Settings size={22} className="text-brand" />
        <h2 className="text-xl font-display font-bold text-white">Configuración</h2>
      </div>

      {/* Profile */}
      <div className="glass-card">
        <div className="flex items-center gap-2 mb-5">
          <User size={18} className="text-brand" />
          <h3 className="font-display font-semibold text-white">Mi Perfil</h3>
        </div>
        <form onSubmit={perfilForm.handleSubmit(handlePerfil)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-1">Nombre</label>
            <input type="text" {...perfilForm.register('nombre')}
              className="w-full px-3 py-2 glass-input text-sm" />
            {perfilForm.formState.errors.nombre && <p className="text-danger text-xs mt-1">{perfilForm.formState.errors.nombre.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-1">Email</label>
            <input type="email" {...perfilForm.register('email')}
              className="w-full px-3 py-2 glass-input text-sm" />
            {perfilForm.formState.errors.email && <p className="text-danger text-xs mt-1">{perfilForm.formState.errors.email.message}</p>}
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={profileLoading}
              className="px-5 py-2 glass-btn flex items-center gap-2">
              {profileLoading && <Loader2 size={16} className="animate-spin" />}
              Guardar cambios
            </button>
          </div>
        </form>
      </div>

      {/* Password */}
      <div className="glass-card">
        <div className="flex items-center gap-2 mb-5">
          <Lock size={18} className="text-brand" />
          <h3 className="font-display font-semibold text-white">Cambiar Contraseña</h3>
        </div>
        <form onSubmit={passwordForm.handleSubmit(handlePassword)} className="space-y-4">
          {['password_actual', 'password_nueva', 'password_confirmar'].map((field) => {
            const labels = { password_actual: 'Contraseña actual', password_nueva: 'Nueva contraseña', password_confirmar: 'Confirmar contraseña' }
            return (
              <div key={field}>
                <label className="block text-sm font-medium text-white mb-1">{labels[field]}</label>
                <div className="relative">
                  <input type={showPasswords[field] ? 'text' : 'password'} {...passwordForm.register(field)}
                    className="w-full px-3 py-2 glass-input text-sm pr-10" />
                  <button type="button" onClick={() => setShowPasswords((p) => ({ ...p, [field]: !p[field] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60">
                    {showPasswords[field] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordForm.formState.errors[field] && <p className="text-danger text-xs mt-1">{passwordForm.formState.errors[field].message}</p>}
              </div>
            )
          })}
          <div className="flex justify-end">
            <button type="submit" disabled={passwordLoading}
              className="px-5 py-2 glass-btn flex items-center gap-2">
              {passwordLoading && <Loader2 size={16} className="animate-spin" />}
              Cambiar contraseña
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
