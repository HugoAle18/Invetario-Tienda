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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-1">Código</label>
          <input
            type="text"
            {...register('codigo')}
            className="w-full px-3 py-2 glass-input text-sm"
          />
          {errors.codigo && <p className="text-danger text-xs mt-1">{errors.codigo.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-1">Nombre</label>
          <input
            type="text"
            {...register('nombre')}
            className="w-full px-3 py-2 glass-input text-sm"
          />
          {errors.nombre && <p className="text-danger text-xs mt-1">{errors.nombre.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-1">Descripción</label>
        <textarea
          {...register('descripcion')}
          rows={2}
          className="w-full px-3 py-2 glass-input text-sm resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-1">Categoría</label>
          <select
            {...register('categoria_id')}
            className="w-full px-3 py-2 glass-input text-sm"
          >
            <option value="">Sin categoría</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-1">Proveedor</label>
          <select
            {...register('proveedor_id')}
            className="w-full px-3 py-2 glass-input text-sm"
          >
            <option value="">Sin proveedor</option>
            {proveedores.map((prov) => (
              <option key={prov.id} value={prov.id}>{prov.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-1">Precio Compra</label>
          <input
            type="number"
            step="0.01"
            {...register('precio_compra')}
            className="w-full px-3 py-2 glass-input text-sm"
          />
          {errors.precio_compra && <p className="text-danger text-xs mt-1">{errors.precio_compra.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-1">Precio Venta</label>
          <input
            type="number"
            step="0.01"
            {...register('precio_venta')}
            className="w-full px-3 py-2 glass-input text-sm"
          />
          {errors.precio_venta && <p className="text-danger text-xs mt-1">{errors.precio_venta.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-1">Stock Mínimo</label>
          <input
            type="number"
            {...register('stock_minimo')}
            className="w-full px-3 py-2 glass-input text-sm"
          />
          {errors.stock_minimo && <p className="text-danger text-xs mt-1">{errors.stock_minimo.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-1">Stock Actual</label>
          <input
            type="number"
            {...register('stock_actual')}
            className="w-full px-3 py-2 glass-input text-sm"
          />
          {errors.stock_actual && <p className="text-danger text-xs mt-1">{errors.stock_actual.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-1">URL de imagen (opcional)</label>
        <input
          type="text"
          {...register('imagen_url')}
          className="w-full px-3 py-2 glass-input text-sm"
          placeholder="https://..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 glass-btn flex items-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {defaultValues?.id ? 'Guardar cambios' : 'Crear producto'}
        </button>
      </div>
    </form>
  )
}
