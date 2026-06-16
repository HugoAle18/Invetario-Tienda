import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'

const productoSchema = z.object({
  codigo: z.string().min(1, 'El código es requerido'),
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional(),
  categoria_id: z.string().optional(),
  proveedor_id: z.string().optional(),
  precio_compra: z.coerce.number().min(0, 'Debe ser mayor o igual a 0'),
  precio_venta: z.coerce.number().min(0, 'Debe ser mayor o igual a 0'),
  stock_minimo: z.coerce.number().int().min(0, 'Debe ser mayor o igual a 0'),
  stock_actual: z.coerce.number().int().min(0, 'Debe ser mayor o igual a 0'),
  imagen_url: z.string().optional(),
})

export default function ProductoForm({ defaultValues, categorias, proveedores, onSubmit, loading }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productoSchema),
    defaultValues: {
      codigo: '',
      nombre: '',
      descripcion: '',
      categoria_id: '',
      proveedor_id: '',
      precio_compra: 0,
      precio_venta: 0,
      stock_minimo: 0,
      stock_actual: 0,
      imagen_url: '',
      ...defaultValues,
    },
  })

  useEffect(() => {
    if (defaultValues) reset(defaultValues)
  }, [defaultValues, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Código</label>
          <input
            type="text"
            {...register('codigo')}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          {errors.codigo && <p className="text-danger text-xs mt-1">{errors.codigo.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
          <input
            type="text"
            {...register('nombre')}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          {errors.nombre && <p className="text-danger text-xs mt-1">{errors.nombre.message}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
        <textarea
          {...register('descripcion')}
          rows={3}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Categoría</label>
          <select
            {...register('categoria_id')}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          >
            <option value="" className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white">Sin categoría</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id} className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white">{cat.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Proveedor</label>
          <select
            {...register('proveedor_id')}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          >
            <option value="" className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white">Sin proveedor</option>
            {proveedores.map((prov) => (
              <option key={prov.id} value={prov.id} className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white">{prov.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Precio Compra</label>
          <input
            type="number"
            step="0.01"
            {...register('precio_compra')}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          {errors.precio_compra && <p className="text-danger text-xs mt-1">{errors.precio_compra.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Precio Venta</label>
          <input
            type="number"
            step="0.01"
            {...register('precio_venta')}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          {errors.precio_venta && <p className="text-danger text-xs mt-1">{errors.precio_venta.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Stock Mínimo</label>
          <input
            type="number"
            {...register('stock_minimo')}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          {errors.stock_minimo && <p className="text-danger text-xs mt-1">{errors.stock_minimo.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Stock Actual</label>
          <input
            type="number"
            {...register('stock_actual')}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          {errors.stock_actual && <p className="text-danger text-xs mt-1">{errors.stock_actual.message}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">URL de imagen (opcional)</label>
        <input
          type="text"
          {...register('imagen_url')}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          placeholder="https://..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold text-sm py-2.5 rounded-xl transition-all shadow-md font-sans tracking-wide mt-2 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {defaultValues?.id ? 'Guardar cambios' : 'Crear producto'}
        </button>
      </div>
    </form>
  )
}
