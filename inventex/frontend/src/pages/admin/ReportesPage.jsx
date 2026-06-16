import { useState, useEffect, useCallback } from 'react'
import { reportesApi } from '@/api/reportes'
import { productosApi } from '@/api/productos'
import { movimientosApi } from '@/api/movimientos'
import { proveedoresApi } from '@/api/proveedores'
import { categoriasApi } from '@/api/categorias'
import toast from 'react-hot-toast'
import {
  BarChart3, Loader2, AlertCircle, RefreshCw, FileSpreadsheet,
  AlertTriangle, TrendingUp, TrendingDown, ChevronDown, ChevronRight,
} from 'lucide-react'
import { exportarMovimientos, exportarInventario, exportarProductosBajoMinimo, exportarPorProveedor } from '@/utils/exportExcel'

const TABS = [
  { key: 'movimientos', icon: '📊', label: 'Movimientos' },
  { key: 'inventario', icon: '📦', label: 'Inventario' },
  { key: 'stockBajo', icon: '⚠️', label: 'Stock Bajo' },
  { key: 'proveedores', icon: '🚚', label: 'Por Proveedor' },
]

function formatCurrency(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n)
}

function formatNumber(n) {
  return Number(n).toLocaleString('es-MX')
}

function formatearFecha(valor) {
  if (!valor) return ''
  const d = new Date(valor)
  if (isNaN(d.getTime())) return valor
  const dia = String(d.getDate()).padStart(2, '0')
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const anio = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${dia}/${mes}/${anio} ${hh}:${mm}`
}

export default function ReportesPage() {
  const [activeTab, setActiveTab] = useState('movimientos')
  const [movimientos, setMovimientos] = useState([])
  const [productos, setProductos] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [exportando, setExportando] = useState(null)
  const [expandedProv, setExpandedProv] = useState(null)
  const [desde, setDesde] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split('T')[0]
  })
  const [hasta, setHasta] = useState(() => new Date().toISOString().split('T')[0])
  const [catFilter, setCatFilter] = useState('')

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [movRes, prodRes, provRes, catRes] = await Promise.all([
        movimientosApi.listar({ limit: 10000 }),
        productosApi.listar({ limit: 10000 }),
        proveedoresApi.listar(),
        categoriasApi.listar(),
      ])
      setMovimientos(movRes.data || [])
      setProductos(prodRes.data || [])
      setProveedores(provRes.data || [])
      setCategorias(catRes.data || [])
    } catch {
      setError('Error al cargar reportes')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const movsFiltrados = movimientos.filter((m) => {
    if (!m.created_at) return true
    const fecha = m.created_at.split('T')[0]
    if (desde && fecha < desde) return false
    if (hasta && fecha > hasta) return false
    return true
  })

  const totalEntradas = movsFiltrados.filter((m) => m.tipo === 'entrada').reduce((s, m) => s + (m.cantidad || 0), 0)
  const totalSalidas = movsFiltrados.filter((m) => m.tipo === 'salida').reduce((s, m) => s + (m.cantidad || 0), 0)

  const prodConCategoria = catFilter
    ? productos.filter((p) => p.categoria_id === catFilter)
    : productos

  const prodBajoStock = productos.filter((p) => p.stock_actual <= p.stock_minimo)
  const sinStock = productos.filter((p) => p.stock_actual <= 0)
  const valorTotal = productos.reduce((s, p) => s + (Number(p.precio_compra) || 0) * (p.stock_actual || 0), 0)
  const totalStock = productos.reduce((s, p) => s + (p.stock_actual || 0), 0)

  const handleExportMovimientos = async () => {
    setExportando('movimientos')
    try {
      const { data } = await movimientosApi.listar({ limit: 10000, fecha_desde: desde, fecha_hasta: hasta })
      if (!data || data.length === 0) { toast.error('No hay movimientos para exportar'); setExportando(null); return }
      exportarMovimientos(data, { desde })
      toast.success('Excel generado correctamente')
    } catch { toast.error('Error al exportar movimientos') }
    finally { setExportando(null) }
  }

  const handleExportInventario = async () => {
    setExportando('inventario')
    try {
      exportarInventario(prodConCategoria)
      toast.success('Excel generado correctamente')
    } catch { toast.error('Error al exportar inventario') }
    finally { setExportando(null) }
  }

  const handleExportStockBajo = async () => {
    setExportando('stockBajo')
    try {
      if (prodConCategoria.length === 0) { toast.error('No hay productos para exportar'); setExportando(null); return }
      exportarProductosBajoMinimo(prodConCategoria)
      toast.success('Excel generado correctamente')
    } catch { toast.error('Error al exportar stock bajo') }
    finally { setExportando(null) }
  }

  const handleExportProveedores = async () => {
    setExportando('proveedores')
    try {
      const datos = proveedores.map((prov) => {
        const rels = productos.filter((p) => p.proveedor_id === prov.id)
        return {
          nombre: prov.nombre,
          producto: rels.map((p) => p.nombre).join(', '),
          codigo: rels.map((p) => p.codigo).join(', '),
          total_entradas: 0,
          total_salidas: 0,
        }
      })
      if (datos.length === 0) { toast.error('No hay proveedores para exportar'); setExportando(null); return }
      exportarPorProveedor(datos)
      toast.success('Excel generado correctamente')
    } catch { toast.error('Error al exportar proveedores') }
    finally { setExportando(null) }
  }

  const aplicaFiltros = () => {
    fetchAll()
  }

  const limpiarFiltros = () => {
    const d = new Date(); d.setDate(d.getDate() - 30)
    setDesde(d.toISOString().split('T')[0])
    setHasta(new Date().toISOString().split('T')[0])
    setCatFilter('')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-bg-hover rounded-lg animate-pulse" />
        <div className="h-12 bg-bg-hover rounded-xl animate-pulse" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-10 flex-1 bg-bg-hover rounded-lg animate-pulse" />)}
        </div>
        <div className="h-96 bg-bg-hover rounded-xl animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center py-20">
        <AlertCircle size={48} className="text-danger mb-4" />
        <p className="text-lg font-medium text-text-primary mb-2">{error}</p>
        <button onClick={fetchAll} className="flex items-center gap-2 px-4 py-2 glass-btn text-sm">
          <RefreshCw size={16} /> Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <BarChart3 size={24} className="text-brand" />
          <h1 className="text-2xl font-display font-bold text-text-primary">Reportes y Estadísticas</h1>
        </div>
        <p className="text-text-secondary mt-1">Analiza el rendimiento de tu inventario</p>
      </div>

      {/* Sticky filter bar */}
      <div className="sticky top-0 z-10 glass rounded-xl p-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Desde</label>
          <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)}
            className="glass-input px-3 py-1.5 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Hasta</label>
          <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)}
            className="glass-input px-3 py-1.5 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Categoría</label>
          <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
            className="glass-input px-3 py-1.5 text-sm min-w-[150px]">
            <option value="">Todas</option>
            {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>
        <button onClick={aplicaFiltros} className="glass-btn px-4 py-1.5 text-sm h-[34px]">
          Aplicar filtros
        </button>
        <button onClick={limpiarFiltros} className="glass-btn-secondary px-4 py-1.5 text-sm h-[34px]">
          Limpiar
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {TABS.map((tab) => {
          let count = 0
          if (tab.key === 'movimientos') count = movsFiltrados.length
          if (tab.key === 'inventario') count = prodConCategoria.length
          if (tab.key === 'stockBajo') count = prodBajoStock.length
          if (tab.key === 'proveedores') count = proveedores.length

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-brand text-white'
                  : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span className={`text-xs ml-1 ${activeTab === tab.key ? 'text-white/70' : 'text-text-muted'}`}>
                ({count})
              </span>
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div className="glass rounded-xl">
        {/* Export buttons */}
        <div className="flex items-center justify-end gap-2 p-4 pb-0">
          <button
            onClick={() => {
              if (activeTab === 'movimientos') handleExportMovimientos()
              else if (activeTab === 'inventario') handleExportInventario()
              else if (activeTab === 'stockBajo') handleExportStockBajo()
              else if (activeTab === 'proveedores') handleExportProveedores()
            }}
            disabled={exportando !== null}
            className="flex items-center gap-1.5 px-3 py-1.5 glass-btn text-sm disabled:opacity-50"
          >
            {exportando ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
            {exportando ? 'Exportando...' : '📊 Excel'}
          </button>
        </div>

        <div className="p-4">
          {/* MOVIMIENTOS TAB */}
          {activeTab === 'movimientos' && (
            <div className="space-y-4">
              <div className="flex gap-3 flex-wrap">
                <div className="px-3 py-1.5 rounded-lg bg-success/10 text-success text-sm flex items-center gap-1.5">
                  <TrendingUp size={16} /> Total entradas: {formatNumber(totalEntradas)} uds
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-danger/10 text-danger text-sm flex items-center gap-1.5">
                  <TrendingDown size={16} /> Total salidas: {formatNumber(totalSalidas)} uds
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-brand/10 text-brand text-sm">
                  Movimientos: {movsFiltrados.length}
                </div>
              </div>

              {movsFiltrados.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-text-muted">
                  <BarChart3 size={32} className="mb-2" />
                  <p className="text-sm">Sin movimientos en el período seleccionado</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-bg-border text-text-muted label-mono">
                        <th className="text-left py-3 px-2 font-medium">Fecha/Hora</th>
                        <th className="text-left py-3 px-2 font-medium">Producto</th>
                        <th className="text-left py-3 px-2 font-medium">Tipo</th>
                        <th className="text-right py-3 px-2 font-medium">Cantidad</th>
                        <th className="text-left py-3 px-2 font-medium hidden md:table-cell">Motivo</th>
                        <th className="text-left py-3 px-2 font-medium hidden sm:table-cell">Usuario</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movsFiltrados.slice(0, 500).map((m) => (
                        <tr key={m.id} className="border-b border-bg-border hover:bg-bg-hover transition-colors">
                          <td className="py-2.5 px-2 text-text-muted text-xs whitespace-nowrap">{formatearFecha(m.created_at)}</td>
                          <td className="py-2.5 px-2 text-text-primary font-medium">{m.productos?.nombre || m.producto || ''}</td>
                          <td className="py-2.5 px-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                              m.tipo === 'entrada' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                            }`}>
                              {m.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-right text-text-primary font-semibold">{m.cantidad}</td>
                          <td className="py-2.5 px-2 text-text-secondary hidden md:table-cell max-w-[200px] truncate">{m.motivo}</td>
                          <td className="py-2.5 px-2 text-text-secondary hidden sm:table-cell">{m.usuarios?.nombre || m.usuario || ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {movsFiltrados.length > 500 && (
                    <p className="text-center text-text-muted text-xs mt-3">
                      Mostrando 500 de {movsFiltrados.length} movimientos
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* INVENTARIO TAB */}
          {activeTab === 'inventario' && (
            <div className="space-y-4">
              <div className="flex gap-3 flex-wrap">
                <div className="px-3 py-1.5 rounded-lg bg-brand/10 text-brand text-sm">
                  Valor total: {formatCurrency(valorTotal)}
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-bg-hover text-text-primary text-sm">
                  Productos: {prodConCategoria.length}
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-danger/10 text-danger text-sm">
                  Sin stock: {sinStock.length}
                </div>
              </div>

              {prodConCategoria.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-text-muted">
                  <BarChart3 size={32} className="mb-2" />
                  <p className="text-sm">No hay productos registrados</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-bg-border text-text-muted label-mono">
                        <th className="text-left py-3 px-2 font-medium">Código</th>
                        <th className="text-left py-3 px-2 font-medium">Nombre</th>
                        <th className="text-left py-3 px-2 font-medium hidden md:table-cell">Categoría</th>
                        <th className="text-right py-3 px-2 font-medium">Stock</th>
                        <th className="text-left py-3 px-2 font-medium">Estado</th>
                        <th className="text-right py-3 px-2 font-medium hidden lg:table-cell">Precio Compra</th>
                        <th className="text-right py-3 px-2 font-medium hidden lg:table-cell">Precio Venta</th>
                        <th className="text-right py-3 px-2 font-medium">Valor en Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        let totalStockCalc = 0
                        let totalValorCalc = 0
                        const rows = prodConCategoria.map((p) => {
                          const estado = p.stock_actual <= 0 ? 'Sin stock' : p.stock_actual <= p.stock_minimo ? 'Stock bajo' : 'Disponible'
                          const valorStock = (Number(p.precio_compra) || 0) * (p.stock_actual || 0)
                          totalStockCalc += p.stock_actual || 0
                          totalValorCalc += valorStock
                          return { p, estado, valorStock }
                        })
                        return (
                          <>
                            {rows.map(({ p, estado, valorStock }) => (
                              <tr key={p.id} className="border-b border-bg-border hover:bg-bg-hover transition-colors">
                                <td className="py-2.5 px-2 font-mono text-xs text-text-muted">{p.codigo}</td>
                                <td className="py-2.5 px-2 text-text-primary font-medium">{p.nombre}</td>
                                <td className="py-2.5 px-2 text-text-secondary hidden md:table-cell">{p.categorias?.nombre || '—'}</td>
                                <td className="py-2.5 px-2 text-right text-text-primary font-semibold">{p.stock_actual}</td>
                                <td className="py-2.5 px-2">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                    estado === 'Disponible' ? 'bg-success/10 text-success'
                                    : estado === 'Stock bajo' ? 'bg-warning/10 text-warning'
                                    : 'bg-danger/10 text-danger'
                                  }`}>
                                    {estado === 'Disponible' && '🟢'}
                                    {estado === 'Stock bajo' && '🟡'}
                                    {estado === 'Sin stock' && '🔴'}
                                    {' '}{estado}
                                  </span>
                                </td>
                                <td className="py-2.5 px-2 text-right text-text-secondary hidden lg:table-cell">{formatCurrency(p.precio_compra)}</td>
                                <td className="py-2.5 px-2 text-right text-text-secondary hidden lg:table-cell">{formatCurrency(p.precio_venta)}</td>
                                <td className="py-2.5 px-2 text-right text-text-primary font-mono">{formatCurrency(valorStock)}</td>
                              </tr>
                            ))}
                            {/* Totals row */}
                            <tr className="bg-brand/10 font-semibold">
                              <td className="py-3 px-2 text-text-primary" colSpan={3}>TOTALES</td>
                              <td className="py-3 px-2 text-right text-text-primary">{formatNumber(totalStockCalc)}</td>
                              <td />
                              <td className="hidden lg:table-cell" />
                              <td className="hidden lg:table-cell" />
                              <td className="py-3 px-2 text-right text-text-primary font-mono">{formatCurrency(totalValorCalc)}</td>
                            </tr>
                          </>
                        )
                      })()}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* STOCK BAJO TAB */}
          {activeTab === 'stockBajo' && (
            <div className="space-y-4">
              {prodBajoStock.length > 0 && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-warning/10 border border-warning/20 text-warning text-sm">
                  <AlertTriangle size={20} />
                  <span>{prodBajoStock.length} productos requieren reposición inmediata</span>
                </div>
              )}

              {prodBajoStock.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-text-muted">
                  <AlertTriangle size={32} className="mb-2" />
                  <p className="text-sm">No hay productos con stock bajo</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-bg-border text-text-muted label-mono">
                        <th className="text-left py-3 px-2 font-medium">Código</th>
                        <th className="text-left py-3 px-2 font-medium">Nombre</th>
                        <th className="text-left py-3 px-2 font-medium hidden md:table-cell">Categoría</th>
                        <th className="text-right py-3 px-2 font-medium">Stock Actual</th>
                        <th className="text-right py-3 px-2 font-medium">Stock Mínimo</th>
                        <th className="text-right py-3 px-2 font-medium">Faltante</th>
                        <th className="text-left py-3 px-2 font-medium hidden lg:table-cell">Proveedor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...prodBajoStock]
                        .sort((a, b) => (a.stock_actual - a.stock_minimo) - (b.stock_actual - b.stock_minimo))
                        .map((p) => (
                          <tr key={p.id} className="border-b border-bg-border hover:bg-bg-hover transition-colors">
                            <td className="py-2.5 px-2 font-mono text-xs text-text-muted">{p.codigo}</td>
                            <td className="py-2.5 px-2 text-text-primary font-medium">{p.nombre}</td>
                            <td className="py-2.5 px-2 text-text-secondary hidden md:table-cell">{p.categorias?.nombre || '—'}</td>
                            <td className="py-2.5 px-2 text-right text-text-primary font-semibold">{p.stock_actual}</td>
                            <td className="py-2.5 px-2 text-right text-text-secondary">{p.stock_minimo}</td>
                            <td className="py-2.5 px-2 text-right text-danger font-semibold">-{(p.stock_minimo || 0) - (p.stock_actual || 0)} uds</td>
                            <td className="py-2.5 px-2 text-text-secondary hidden lg:table-cell">{p.proveedores?.nombre || '—'}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* PROVEEDORES TAB */}
          {activeTab === 'proveedores' && (
            <div className="space-y-4">
              {proveedores.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-text-muted">
                  <BarChart3 size={32} className="mb-2" />
                  <p className="text-sm">No hay proveedores registrados</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-bg-border text-text-muted label-mono">
                        <th className="text-left py-3 px-2 font-medium w-8" />
                        <th className="text-left py-3 px-2 font-medium">Proveedor</th>
                        <th className="text-right py-3 px-2 font-medium">Productos</th>
                        <th className="text-right py-3 px-2 font-medium hidden sm:table-cell">Entradas</th>
                        <th className="text-right py-3 px-2 font-medium hidden sm:table-cell">Salidas</th>
                        <th className="text-left py-3 px-2 font-medium hidden md:table-cell">Último movimiento</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proveedores.map((prov) => {
                        const rels = productos.filter((p) => p.proveedor_id === prov.id)
                        const entradas = movsFiltrados.filter((m) => rels.some((r) => r.id === m.producto_id) && m.tipo === 'entrada')
                        const salidas = movsFiltrados.filter((m) => rels.some((r) => r.id === m.producto_id) && m.tipo === 'salida')
                        const movsProv = [...entradas, ...salidas].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                        const ultimoMov = movsProv[0]
                        const isExpanded = expandedProv === prov.id

                        return (
                          <tbody key={prov.id}>
                            <tr
                              onClick={() => setExpandedProv(isExpanded ? null : prov.id)}
                              className="border-b border-bg-border hover:bg-bg-hover transition-colors cursor-pointer"
                            >
                              <td className="py-2.5 px-2 text-text-muted">
                                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                              </td>
                              <td className="py-2.5 px-2 text-text-primary font-medium">{prov.nombre}</td>
                              <td className="py-2.5 px-2 text-right text-text-primary font-semibold">{rels.length}</td>
                              <td className="py-2.5 px-2 text-right text-success hidden sm:table-cell">{entradas.length}</td>
                              <td className="py-2.5 px-2 text-right text-danger hidden sm:table-cell">{salidas.length}</td>
                              <td className="py-2.5 px-2 text-text-secondary hidden md:table-cell text-xs">
                                {ultimoMov ? formatearFecha(ultimoMov.created_at) : '—'}
                              </td>
                            </tr>
                            {isExpanded && rels.map((p) => (
                              <tr key={p.id} className="bg-bg-hover/50 border-b border-bg-border">
                                <td />
                                <td className="py-2 px-2 text-text-secondary text-xs pl-8" colSpan={5}>
                                  <span className="font-mono">{p.codigo}</span> — {p.nombre}
                                  <span className="text-text-muted ml-2">Stock: {p.stock_actual}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
