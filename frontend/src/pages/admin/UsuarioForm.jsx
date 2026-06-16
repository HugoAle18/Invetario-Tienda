import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'

const schema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().optional(),
  rol: z.enum(['administrador', 'empleado'], { message: 'Selecciona un rol' }),
}).refine(
  (data) => {
    // Require password only when creating (no id)
    return true // validation handled dynamically in component
  },
  {}
)

export default function UsuarioForm({ defaultValues, onSubmit, loading }) {
  const isEditing = !!defaultValues?.id

  const dynamicSchema = z.object({
    nombre: z.string().min(1, 'El nombre es requerido'),
    email: z.string().email('Email inválido'),
    password: isEditing
      ? z.string().optional()
      : z.string().min(6, 'Mínimo 6 caracteres'),
    rol: z.enum(['administrador', 'empleado'], { message: 'Selecciona un rol' }),
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(dynamicSchema),
    defaultValues: { nombre: '', email: '', password: '', rol: 'empleado', ...defaultValues },
  })

  useEffect(() => {
    if (defaultValues) reset({ ...defaultValues, password: '' })
  }, [defaultValues, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
        <input type="text" {...register('nombre')} className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
        {errors.nombre && <p className="text-danger text-xs mt-1">{errors.nombre.message}</p>}
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
        <input type="email" {...register('email')} className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
        {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Contraseña {isEditing && <span className="text-gray-400 dark:text-gray-500 font-normal">(dejar vacío para mantener)</span>}
        </label>
        <input type="password" {...register('password')} className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
        {errors.password && <p className="text-danger text-xs mt-1">{errors.password.message}</p>}
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Rol</label>
          <select {...register('rol')} className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all">
            <option value="empleado" className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white">Empleado</option>
            <option value="administrador" className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white">Administrador</option>
          </select>
        {errors.rol && <p className="text-danger text-xs mt-1">{errors.rol.message}</p>}
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" disabled={loading} className="px-5 py-2 glass-btn flex items-center gap-2">
          {loading && <Loader2 size={16} className="animate-spin" />}
          {isEditing ? 'Guardar cambios' : 'Crear usuario'}
        </button>
      </div>
    </form>
  )
}
