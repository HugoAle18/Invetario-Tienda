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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
        <input type="text" {...register('nombre')} className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-bg-border bg-gray-50 dark:bg-transparent text-gray-950 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all" />
        {errors.nombre && <p className="text-danger text-xs mt-1">{errors.nombre.message}</p>}
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
        <textarea {...register('descripcion')} rows={3} className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-bg-border bg-gray-50 dark:bg-transparent text-gray-950 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all resize-none" />
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
