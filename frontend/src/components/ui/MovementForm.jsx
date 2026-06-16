import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { productosApi } from '@/api/productos'
import { Loader2, Search } from 'lucide-react'

export default function MovementForm({ tipo, showPrecio, onSubmit, loading }) {
  const [productos, setProductos] = useState([])
  const [productSearch, setProductSearch] = useState('')
  const [busy, setBusy] = useState(true)

  useEffect(() => {
    const load = async () => {
      setBusy(true)
      try {
        const { data } = await productosApi.listar({ limit: 200 })
        setProductos(data.data || [])
      } catch {
        // silent
      } finally {
        setBusy(false)
      }
    }
    load()
  }, [])

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
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { producto_id: '', cantidad: 1, motivo: '', precio_unitario: '' } })

  const filtered = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.codigo.toLowerCase().includes(productSearch.toLowerCase())
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Producto</label>
        <div className="relative mb-2">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            placeholder="Buscar producto..."
            className="w-full pl-8 pr-3 py-1.5 bg-bg-primary border border-bg-border rounded-lg text-text-primary placeholder-text-muted focus:border-brand focus:ring-1 focus:ring-brand outline-none text-sm"
          />
        </div>
        <select
          {...register('producto_id')}
          size={Math.min(filtered.length + 1, 6)}
          className="w-full px-3 py-2 bg-bg-primary border border-bg-border rounded-lg text-text-primary focus:border-brand focus:ring-1 focus:ring-brand outline-none text-sm"
        >
          <option value="">-- Seleccionar --</option>
          {filtered.map((p) => (
            <option key={p.id} value={p.id}>
              [{p.codigo}] {p.nombre} (stock: {p.stock_actual})
            </option>
          ))}
        </select>
        {errors.producto_id && <p className="text-danger text-xs mt-1">{errors.producto_id.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Cantidad</label>
          <input
            type="number"
            min="1"
            {...register('cantidad')}
            className="w-full px-3 py-2 bg-bg-primary border border-bg-border rounded-lg text-text-primary focus:border-brand focus:ring-1 focus:ring-brand outline-none text-sm"
          />
          {errors.cantidad && <p className="text-danger text-xs mt-1">{errors.cantidad.message}</p>}
        </div>
        {showPrecio && (
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Precio unitario</label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('precio_unitario')}
              placeholder="0.00"
              className="w-full px-3 py-2 bg-bg-primary border border-bg-border rounded-lg text-text-primary focus:border-brand focus:ring-1 focus:ring-brand outline-none text-sm"
            />
            {errors.precio_unitario && <p className="text-danger text-xs mt-1">{errors.precio_unitario.message}</p>}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Motivo</label>
        <textarea
          {...register('motivo')}
          rows={2}
          className="w-full px-3 py-2 bg-bg-primary border border-bg-border rounded-lg text-text-primary placeholder-text-muted focus:border-brand focus:ring-1 focus:ring-brand outline-none text-sm resize-none"
          placeholder={tipo === 'entrada' ? 'Compra a proveedor, devolución, etc.' : 'Venta, merma, ajuste, etc.'}
        />
        {errors.motivo && <p className="text-danger text-xs mt-1">{errors.motivo.message}</p>}
      </div>

      <button
        type="submit"
        disabled={loading || busy}
        className="w-full py-2.5 bg-brand hover:bg-brand-hover text-white font-medium rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? 'Registrando...' : `Registrar ${tipo === 'entrada' ? 'Entrada' : 'Salida'}`}
      </button>
    </form>
  )
}
