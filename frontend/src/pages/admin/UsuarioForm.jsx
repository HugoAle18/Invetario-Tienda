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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white mb-1">Nombre</label>
        <input type="text" {...register('nombre')} className="w-full px-3 py-2 glass-input text-sm" />
        {errors.nombre && <p className="text-danger text-xs mt-1">{errors.nombre.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-white mb-1">Email</label>
        <input type="email" {...register('email')} className="w-full px-3 py-2 glass-input text-sm" />
        {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-white mb-1">
          Contraseña {isEditing && <span className="text-white/40 font-normal">(dejar vacío para mantener)</span>}
        </label>
        <input type="password" {...register('password')} className="w-full px-3 py-2 glass-input text-sm" />
        {errors.password && <p className="text-danger text-xs mt-1">{errors.password.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-white mb-1">Rol</label>
        <select {...register('rol')} className="w-full px-3 py-2 glass-input text-sm">
          <option value="empleado">Empleado</option>
          <option value="administrador">Administrador</option>
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
