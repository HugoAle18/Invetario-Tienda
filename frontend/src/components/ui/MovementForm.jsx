import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import ProductoSearch from '@/components/ui/ProductoSearch'

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
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { producto_id: '', cantidad: 1, motivo: '', precio_unitario: '' },
  })

  const cantidad = watch('cantidad')

  const handleProductChange = (product) => {
    setSelectedProduct(product)
    setValue('producto_id', product ? product.id : '', { shouldValidate: true })
    if (product && showPrecio) {
      setValue('precio_unitario', product.precio_compra || '')
    }
  }

  const stockInsuficiente = tipo === 'salida' && selectedProduct && cantidad > selectedProduct.stock_actual

  const previewNuevoStock = selectedProduct && cantidad
    ? tipo === 'entrada'
      ? selectedProduct.stock_actual + Number(cantidad)
      : selectedProduct.stock_actual - Number(cantidad)
    : null

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-text-primary text-sm font-medium mb-1">Producto</label>
        <ProductoSearch
          onSelect={handleProductChange}
          tipo={tipo}
          placeholder="Buscar por nombre o código..."
        />
        {errors.producto_id && <p className="text-danger text-xs mt-1">{errors.producto_id.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-text-primary text-sm font-medium mb-1">Cantidad</label>
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
            <label className="block text-text-primary text-sm font-medium mb-1">Precio unitario</label>
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

      {/* Preview de operación */}
      {selectedProduct && cantidad > 0 && (
        <div className={`rounded-lg px-4 py-3 text-sm ${
          stockInsuficiente
            ? 'bg-danger/15 border border-danger/30 text-danger'
            : tipo === 'entrada'
              ? 'bg-success/10 text-success'
              : 'bg-danger/10 text-danger'
        }`}>
          {stockInsuficiente ? (
            <div className="flex items-center gap-2">
              <span>⛔</span>
              <span>Stock insuficiente. Disponible: <strong>{selectedProduct.stock_actual}</strong> uds</span>
            </div>
          ) : tipo === 'entrada' ? (
            <div className="flex items-center gap-2">
              <span>✅</span>
              <span>Stock: <strong>{selectedProduct.stock_actual}</strong> → <strong>{previewNuevoStock}</strong> unidades (+{cantidad})</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>📤</span>
              <span>Stock: <strong>{selectedProduct.stock_actual}</strong> → <strong>{previewNuevoStock}</strong> unidades (-{cantidad})</span>
            </div>
          )}
        </div>
      )}

      <div>
        <label className="block text-text-primary text-sm font-medium mb-1">Motivo</label>
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
        disabled={loading || stockInsuficiente}
        className="glass-btn w-full py-2.5 flex items-center justify-center gap-2 text-sm"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? 'Registrando...' : `Registrar ${tipo === 'entrada' ? 'Entrada' : 'Salida'}`}
      </button>
    </form>
  )
}
