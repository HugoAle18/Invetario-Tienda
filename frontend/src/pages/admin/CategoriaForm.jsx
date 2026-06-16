import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'

const schema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional(),
})

export default function CategoriaForm({ defaultValues, onSubmit, loading }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { nombre: '', descripcion: '', ...defaultValues },
  })

  useEffect(() => { if (defaultValues) reset(defaultValues) }, [defaultValues, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Nombre</label>
        <input type="text" {...register('nombre')} className="w-full px-3 py-2 glass-input text-sm" />
        {errors.nombre && <p className="text-danger text-xs mt-1">{errors.nombre.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Descripción</label>
        <textarea {...register('descripcion')} rows={3} className="w-full px-3 py-2 glass-input text-sm resize-none" />
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" disabled={loading} className="px-5 py-2 glass-btn flex items-center gap-2">
          {loading && <Loader2 size={16} className="animate-spin" />}
          {defaultValues?.id ? 'Guardar cambios' : 'Crear categoría'}
        </button>
      </div>
    </form>
  )
}
