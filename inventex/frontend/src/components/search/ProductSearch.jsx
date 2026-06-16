import { useState, useEffect, useRef, useCallback } from 'react'
import { productosApi } from '@/api/productos'
import { Search, Loader2, Package } from 'lucide-react'

export default function ProductSearch({ value, onChange, placeholder = 'Buscar producto por código o nombre...', disabled = false, excludeIds = [] }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [selectedLabel, setSelectedLabel] = useState('')
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const debounceRef = useRef(null)

  const fetchResults = useCallback(async (q) => {
    if (!q.trim()) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const { data } = await productosApi.listar({ search: q, limit: 20 })
      const items = (data?.data || data || []).filter((p) => !excludeIds.includes(p.id))
      setResults(items)
      setIsOpen(true)
      setHighlightedIndex(-1)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [excludeIds])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchResults(query), 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, fetchResults])

  const selectItem = (item) => {
    onChange(item)
    setQuery('')
    setSelectedLabel(`[${item.codigo}] ${item.nombre}`)
    setIsOpen(false)
    setResults([])
  }

  const handleChange = (e) => {
    const val = e.target.value
    setQuery(val)
    if (value) onChange(null)
    if (!val.trim()) {
      setIsOpen(false)
      setResults([])
    }
  }

  const handleKeyDown = (e) => {
    if (!isOpen) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1))
    } else if (e.key === 'Enter' && highlightedIndex >= 0 && results[highlightedIndex]) {
      e.preventDefault()
      selectItem(results[highlightedIndex])
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setHighlightedIndex(-1)
    }
  }

  const handleBlur = () => {
    setTimeout(() => {
      setIsOpen(false)
      setHighlightedIndex(-1)
    }, 200)
  }

  const handleClear = () => {
    onChange(null)
    setSelectedLabel('')
    setQuery('')
    setResults([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={selectedLabel || query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results.length > 0) setIsOpen(true) }}
          onBlur={handleBlur}
          placeholder={selectedLabel ? '' : placeholder}
          disabled={disabled}
          className="glass-input w-full pl-9 pr-8 py-2 text-sm"
        />
        {selectedLabel && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors text-lg leading-none"
          >
            &times;
          </button>
        )}
        {loading && !selectedLabel && (
          <Loader2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted animate-spin" />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-50 left-0 right-0 mt-1 glass rounded-xl shadow-xl max-h-60 overflow-y-auto border border-bg-border"
        >
          {results.map((item, index) => (
            <li
              key={item.id}
              onMouseDown={() => selectItem(item)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer text-sm transition-colors ${
                index === highlightedIndex ? 'bg-brand/15 text-text-primary' : 'text-text-secondary hover:bg-bg-hover'
              }`}
            >
              <Package size={14} className="shrink-0 text-text-muted" />
              <div className="min-w-0 flex-1">
                <span className="font-medium text-text-primary">{item.nombre}</span>
                <span className="text-text-muted ml-2 font-mono text-xs">{item.codigo}</span>
              </div>
              <span className={`text-xs font-semibold whitespace-nowrap ${
                item.stock_actual <= item.stock_minimo ? 'text-danger' : 'text-success'
              }`}>
                {item.stock_actual} uds
              </span>
            </li>
          ))}
        </ul>
      )}

      {isOpen && query.trim() && !loading && results.length === 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 glass rounded-xl shadow-xl border border-bg-border px-3 py-4 text-center text-text-muted text-sm">
          No se encontraron productos para &quot;{query}&quot;
        </div>
      )}
    </div>
  )
}
