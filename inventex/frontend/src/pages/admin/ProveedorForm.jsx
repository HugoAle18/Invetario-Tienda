import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'

const schema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  contacto: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  direccion: z.string().optional(),
})

export default function ProveedorForm({ defaultValues, onSubmit, loading }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { nombre: '', contacto: '', telefono: '', email: '', direccion: '', ...defaultValues },
  })

  useEffect(() => { if (defaultValues) reset(defaultValues) }, [defaultValues, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white mb-1">Nombre</label>
        <input type="text" {...register('nombre')} className="w-full px-3 py-2 glass-input text-sm" />
        {errors.nombre && <p className="text-danger text-xs mt-1">{errors.nombre.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-white mb-1">Persona de contacto</label>
        <input type="text" {...register('contacto')} className="w-full px-3 py-2 glass-input text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-1">Teléfono</label>
          <input type="text" {...register('telefono')} className="w-full px-3 py-2 glass-input text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-1">Email</label>
          <input type="email" {...register('email')} className="w-full px-3 py-2 glass-input text-sm" />
          {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-white mb-1">Dirección</label>
        <textarea {...register('direccion')} rows={2} className="w-full px-3 py-2 glass-input text-sm resize-none" />
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" disabled={loading} className="px-5 py-2 glass-btn flex items-center gap-2">
          {loading && <Loader2 size={16} className="animate-spin" />}
          {defaultValues?.id ? 'Guardar cambios' : 'Crear proveedor'}
        </button>
      </div>
    </form>
  )
}
