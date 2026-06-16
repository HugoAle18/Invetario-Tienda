import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'
import { Eye, EyeOff, Loader2, Package } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { login, user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) {
      navigate(user.rol === 'administrador' ? '/admin/dashboard' : '/empleado/panel', { replace: true })
    }
  }, [user, loading, navigate])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data) => {
    setSubmitting(true)
    try {
      const userData = await login(data.email, data.password)
      toast.success(`Bienvenido, ${userData.nombre}`)
      navigate(userData.rol === 'administrador' ? '/admin/dashboard' : '/empleado/panel', { replace: true })
    } catch (err) {
      const status = err.response?.status
      const data = err.response?.data
      console.log('[LOGIN ERROR]', { status, data, message: err.message })
      const msg = data?.error || 'Error al iniciar sesión'
      toast.error(`Error ${status}: ${msg}`, { duration: 8000 })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-brand" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-container mb-4">
            <Package size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-text-primary">INVENTEX</h1>
          <p className="text-text-secondary mt-1">Sistema de Gestión de Inventario</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="glass-card space-y-5">
          <div>
            <label className="block text-sm font-medium text-white mb-1.5">Correo electrónico</label>
            <input
              type="email"
              {...register('email')}
              className="glass-input w-full px-3 py-2.5"
              placeholder="admin@inventex.com"
            />
            {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1.5">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                className="glass-input w-full px-3 py-2.5 pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-danger text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="glass-btn w-full py-2.5 flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 size={18} className="animate-spin" />}
            {submitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}
