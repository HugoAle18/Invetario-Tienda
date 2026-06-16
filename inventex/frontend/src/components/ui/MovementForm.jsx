import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Package } from 'lucide-react'
import ProductSearch from '@/components/search/ProductSearch'

export default function MovementForm({ tipo, showPrecio, onSubmit, loading }) {
  const [selectedProduct, setSelectedProduct] = useState(null)

  const schema = z.object({
    producto_id: z.string().min(1, 'Selecciona un producto'),
    cantidad: z.coerce.number().int().min(1, 'Debe ser al menos 1'),
    motivo: z.string().min(1, 'El motivo es requerido'),
    precio_unitario: showPrecio
      ? z.coerce.number().min(0, 'Debe ser mayor o igual a 0').optional()
      : z.any().optional(),
  })

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { producto_id: '', cantidad: 1, motivo: '', precio_unitario: '' },
  })

  const handleProductChange = (product) => {
    setSelectedProduct(product)
    setValue('producto_id', product ? product.id : '', { shouldValidate: true })
    if (product && showPrecio) {
      setValue('precio_unitario', product.precio_compra || '')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-white/80 text-sm font-medium mb-1">Producto</label>
        <ProductSearch value={selectedProduct} onChange={handleProductChange} />
        {errors.producto_id && <p className="text-danger text-xs mt-1">{errors.producto_id.message}</p>}
        {selectedProduct && (
          <div className="flex items-center gap-3 mt-2 px-3 py-2 rounded-lg bg-white/[0.04] text-xs text-white/60">
            <Package size={14} />
            <span>Stock actual: <strong className={selectedProduct.stock_actual <= selectedProduct.stock_minimo ? 'text-danger' : 'text-success'}>{selectedProduct.stock_actual}</strong></span>
            <span>Precio compra: <strong>${Number(selectedProduct.precio_compra).toFixed(2)}</strong></span>
            <span>Precio venta: <strong>${Number(selectedProduct.precio_venta).toFixed(2)}</strong></span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-white/80 text-sm font-medium mb-1">Cantidad</label>
          <input
            type="number"
            min="1"
            {...register('cantidad')}
            className="glass-input w-full px-3 py-2 text-sm"
          />
          {errors.cantidad && <p className="text-danger text-xs mt-1">{errors.cantidad.message}</p>}
        </div>
        {showPrecio && (
          <div>
            <label className="block text-white/80 text-sm font-medium mb-1">Precio unitario</label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('precio_unitario')}
              placeholder="0.00"
              className="glass-input w-full px-3 py-2 text-sm"
            />
            {errors.precio_unitario && <p className="text-danger text-xs mt-1">{errors.precio_unitario.message}</p>}
          </div>
        )}
      </div>

      <div>
        <label className="block text-white/80 text-sm font-medium mb-1">Motivo</label>
        <textarea
          {...register('motivo')}
          rows={2}
          className="glass-input w-full px-3 py-2 text-sm resize-none"
          placeholder={tipo === 'entrada' ? 'Compra a proveedor, devolución, etc.' : 'Venta, merma, ajuste, etc.'}
        />
        {errors.motivo && <p className="text-danger text-xs mt-1">{errors.motivo.message}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="glass-btn w-full py-2.5 flex items-center justify-center gap-2 text-sm"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? 'Registrando...' : `Registrar ${tipo === 'entrada' ? 'Entrada' : 'Salida'}`}
      </button>
    </form>
  )
}
