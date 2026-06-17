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
    setValue,
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
            <label className="block text-sm font-medium text-text-primary mb-1.5">Correo electrónico</label>
            <input
              type="email"
              {...register('email')}
              className="glass-input w-full px-3 py-2.5"
              placeholder="admin@inventex.com"
            />
            {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Contraseña</label>
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
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

          {/* Quick Login — Demo Credentials */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 tracking-wide uppercase">
              Acceso Rápido (Evaluación)
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setValue('email', 'admin@inventex.com')
                  setValue('password', 'admin123')
                }}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 text-blue-600 dark:text-blue-400 transition-all active:scale-95 text-xs cursor-pointer"
              >
                <span className="font-bold">🔑 Administrador</span>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5">admin@inventex.com</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setValue('email', 'empleado@inventex.com')
                  setValue('password', 'empleado123')
                }}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-600 dark:text-emerald-400 transition-all active:scale-95 text-xs cursor-pointer"
              >
                <span className="font-bold">💼 Empleado</span>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5">empleado@inventex.com</span>
              </button>
            </div>

            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 italic">
              * Haz clic en un rol para autorrellenar el formulario.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
