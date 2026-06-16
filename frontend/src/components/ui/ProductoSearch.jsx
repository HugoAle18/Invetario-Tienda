import { useState, useEffect, useRef, useCallback } from 'react'
import { productosApi } from '@/api/productos'
import { Search, Loader2, Package, AlertTriangle, XCircle, X } from 'lucide-react'

export default function ProductoSearch({ onSelect, tipo = 'entrada', placeholder = 'Buscar por nombre o código...' }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [selected, setSelected] = useState(null)
  const inputRef = useRef(null)
  const containerRef = useRef(null)
  const debounceRef = useRef(null)

  const fetchResults = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); setLoading(false); return }
    setLoading(true)
    try {
      const { data } = await productosApi.listar({ search: q, limit: 20 })
      const items = data?.data || data || []
      setResults(items)
      setIsOpen(true)
      setHighlightedIndex(-1)
    } catch { setResults([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchResults(query), 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, fetchResults])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
        setHighlightedIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectItem = (item) => {
    if (tipo === 'salida' && item.stock_actual <= 0) return
    setSelected(item)
    setQuery('')
    setIsOpen(false)
    setResults([])
    if (onSelect) onSelect(item)
  }

  const handleClear = () => {
    setSelected(null)
    setQuery('')
    setResults([])
    setIsOpen(false)
    if (onSelect) onSelect(null)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const handleChange = (e) => {
    const val = e.target.value
    setQuery(val)
    if (!val.trim()) { setIsOpen(false); setResults([]) }
  }

  const handleKeyDown = (e) => {
    if (!isOpen) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightedIndex((p) => (p < results.length - 1 ? p + 1 : 0)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightedIndex((p) => (p > 0 ? p - 1 : results.length - 1)) }
    else if (e.key === 'Enter' && highlightedIndex >= 0 && results[highlightedIndex]) { e.preventDefault(); selectItem(results[highlightedIndex]) }
    else if (e.key === 'Escape') { setIsOpen(false); setHighlightedIndex(-1) }
  }

  const stockStatus = (stock, min) => {
    if (stock <= 0) return { label: 'Sin stock', color: 'text-danger', icon: XCircle }
    if (stock <= min) return { label: 'Stock bajo', color: 'text-warning', icon: AlertTriangle }
    return { label: 'Disponible', color: 'text-success', icon: null }
  }

  // Selected product card
  if (selected) {
    const status = stockStatus(selected.stock_actual, selected.stock_minimo)
    const StatusIcon = status.icon
    return (
      <div className="glass rounded-xl p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Package size={18} className="text-brand shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate">{selected.nombre}</p>
              <p className="text-xs text-text-muted">
                Código: {selected.codigo}
                {selected.categorias?.nombre && <span> • {selected.categorias.nombre}</span>}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
          >
            <X size={14} /> Cambiar
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-xs text-text-muted mb-0.5">Stock actual</p>
            <p className={`text-2xl font-bold font-display ${status.color}`}>
              {selected.stock_actual} <span className="text-sm font-normal text-text-muted">unidades</span>
            </p>
          </div>
          <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${
            status.label === 'Disponible' ? 'bg-success/10 text-success'
            : status.label === 'Stock bajo' ? 'bg-warning/10 text-warning'
            : 'bg-danger/10 text-danger'
          }`}>
            {StatusIcon && <StatusIcon size={14} />}
            {!StatusIcon && <span>🟢</span>}
            <span>{status.label}</span>
          </div>
        </div>
      </div>
    )
  }

  // Search input
  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results.length > 0) setIsOpen(true) }}
          placeholder={placeholder}
          className="glass-input w-full pl-9 pr-8 py-2 text-sm"
        />
        {loading && <Loader2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted animate-spin" />}
      </div>

      {/* Dropdown */}
      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 mt-1 glass rounded-xl shadow-xl overflow-y-auto border border-bg-border"
          style={{ maxHeight: '320px' }}>
          {results.slice(0, 8).map((item, index) => {
            const isDisabled = tipo === 'salida' && item.stock_actual <= 0
            const status = stockStatus(item.stock_actual, item.stock_minimo)
            const StatusIcon = status.icon
            return (
              <li
                key={item.id}
                onMouseDown={() => !isDisabled && selectItem(item)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                  isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                } ${
                  index === highlightedIndex && !isDisabled ? 'bg-brand/15 text-text-primary' : 'text-text-secondary hover:bg-bg-hover'
                }`}
              >
                <span className="shrink-0 font-mono text-[10px] bg-bg-border text-text-muted px-1.5 py-0.5 rounded">
                  {item.codigo}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-text-primary truncate">{item.nombre}</p>
                  <p className="text-xs text-text-muted truncate">
                    {item.categorias?.nombre || ''}
                    <span className="ml-2">{item.stock_actual} unidades</span>
                  </p>
                </div>
                <div className={`shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  status.label === 'Disponible' ? 'bg-success/10 text-success'
                  : status.label === 'Stock bajo' ? 'bg-warning/10 text-warning'
                  : 'bg-danger/10 text-danger'
                }`}>
                  {StatusIcon && <StatusIcon size={10} />}
                  {!StatusIcon && <span>🟢</span>}
                  <span>{status.label}</span>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {isOpen && query.trim() && !loading && results.length === 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 glass rounded-xl shadow-xl border border-bg-border px-3 py-4 text-center text-text-muted text-sm">
          No se encontraron productos
        </div>
      )}
    </div>
  )
}
