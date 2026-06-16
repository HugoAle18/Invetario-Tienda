import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

function fechaActual() {
  const d = new Date()
  const dia = String(d.getDate()).padStart(2, '0')
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const anio = d.getFullYear()
  return `${dia}-${mes}-${anio}`
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

function autoAncho(worksheet) {
  if (!worksheet['!ref']) return
  const rango = XLSX.utils.decode_range(worksheet['!ref'])
  const cols = []
  for (let c = rango.s.c; c <= rango.e.c; c++) {
    let maxLen = 10
    for (let r = rango.s.r; r <= rango.e.r; r++) {
      const celda = worksheet[XLSX.utils.encode_cell({ r, c })]
      if (celda && celda.v !== undefined && celda.v !== null) {
        maxLen = Math.max(maxLen, String(celda.v).length)
      }
    }
    cols.push({ wch: Math.min(maxLen + 4, 50) })
  }
  worksheet['!cols'] = cols
}

function aplicarEstilo(hojas) {
  for (const name of Object.keys(hojas)) {
    const ws = hojas[name]
    if (!ws['!ref']) continue
    const rango = XLSX.utils.decode_range(ws['!ref'])
    // Headers: bold, blue bg, white text
    for (let c = 0; c <= rango.e.c; c++) {
      const ref = XLSX.utils.encode_cell({ r: 0, c })
      if (ws[ref]) {
        ws[ref].s = {
          fill: { fgColor: { rgb: '2563EB' } },
          font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
          alignment: { horizontal: 'center', vertical: 'center' },
        }
      }
    }
    // Data rows: alternating white / #f8fafc
    for (let r = 1; r <= rango.e.r; r++) {
      const color = r % 2 === 0 ? 'F8FAFC' : 'FFFFFF'
      for (let c = 0; c <= rango.e.c; c++) {
        const ref = XLSX.utils.encode_cell({ r, c })
        if (ws[ref]) {
          ws[ref].s = {
            ...ws[ref].s,
            fill: { fgColor: { rgb: color } },
            font: { ...ws[ref].s?.font, sz: 10 },
            alignment: { vertical: 'center' },
          }
        }
      }
    }
    // Freeze first row
    ws['!freeze'] = { xSplit: 0, ySplit: 1 }
    // Auto-width
    autoAncho(ws)
  }
}

function crearYFinalizar(hojaName, filas, nombreArchivo) {
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(filas)
  XLSX.utils.book_append_sheet(wb, ws, hojaName)
  const sheets = {}
  sheets[hojaName] = ws
  aplicarEstilo(sheets)
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), nombreArchivo)
}

export function exportarMovimientos(data, filtros = {}) {
  if (!data || data.length === 0) return
  const filas = data.map((m) => ({
    Fecha: formatearFecha(m.created_at),
    Producto: m.productos?.nombre || m.producto || '',
    Código: m.productos?.codigo || '',
    Tipo: m.tipo === 'entrada' ? 'Entrada' : 'Salida',
    Cantidad: m.cantidad || 0,
    'Stock Anterior': m.stock_anterior ?? '-',
    'Stock Nuevo': m.stock_nuevo ?? '-',
    Motivo: m.motivo || '',
    Referencia: m.referencia ?? '-',
    Usuario: m.usuarios?.nombre || m.usuario || '',
  }))
  crearYFinalizar('Movimientos', filas, `INVENTEX_Movimientos_${fechaActual()}.xlsx`)
}

export function exportarInventario(data) {
  if (!data || data.length === 0) return
  let totalStock = 0
  let totalValor = 0
  const filas = data.map((p) => {
    const estado = p.stock_actual <= 0 ? 'Sin stock' : p.stock_actual <= p.stock_minimo ? 'Stock bajo' : 'Disponible'
    const valorStock = (Number(p.precio_compra) || 0) * (p.stock_actual || 0)
    totalStock += p.stock_actual || 0
    totalValor += valorStock
    return {
      Código: p.codigo,
      Nombre: p.nombre,
      Categoría: p.categorias?.nombre || '',
      Proveedor: p.proveedores?.nombre || '',
      'Stock Actual': p.stock_actual || 0,
      'Stock Mínimo': p.stock_minimo || 0,
      Unidad: 'unidad(es)',
      Estado: estado,
      'Precio Compra': Number(p.precio_compra) || 0,
      'Precio Venta': Number(p.precio_venta) || 0,
      'Valor en Stock': valorStock,
    }
  })
  filas.push({
    Código: 'TOTALES',
    Nombre: '',
    Categoría: '',
    Proveedor: '',
    'Stock Actual': totalStock,
    'Stock Mínimo': '',
    Unidad: '',
    Estado: '',
    'Precio Compra': '',
    'Precio Venta': '',
    'Valor en Stock': totalValor,
  })
  crearYFinalizar('Inventario Actual', filas, `INVENTEX_Inventario_${fechaActual()}.xlsx`)
}

export function exportarProductosBajoMinimo(data) {
  if (!data || data.length === 0) return
  const ordenados = [...data]
    .filter((p) => p.stock_actual <= p.stock_minimo)
    .sort((a, b) => (b.stock_minimo - b.stock_actual) - (a.stock_minimo - a.stock_actual))
  const filas = ordenados.map((p) => ({
    Código: p.codigo,
    Nombre: p.nombre,
    Categoría: p.categorias?.nombre || '',
    'Stock Actual': p.stock_actual || 0,
    'Stock Mínimo': p.stock_minimo || 0,
    Diferencia: (p.stock_minimo || 0) - (p.stock_actual || 0),
    Unidad: 'unidad(es)',
    Proveedor: p.proveedores?.nombre || '',
  }))
  crearYFinalizar('Stock Bajo', filas, `INVENTEX_StockBajo_${fechaActual()}.xlsx`)
}

export function exportarPorProveedor(data) {
  if (!data || data.length === 0) return
  const filas = data.map((prov) => ({
    Proveedor: prov.nombre || prov.Proveedor || '',
    Producto: prov.producto || prov.Producto || '',
    Código: prov.codigo || prov.Código || '',
    'Cantidad Entradas': prov.total_entradas || prov['Cantidad Entradas'] || 0,
    'Cantidad Salidas': prov.total_salidas || prov['Cantidad Salidas'] || 0,
    'Movimientos Totales': (prov.total_entradas || prov['Cantidad Entradas'] || 0) + (prov.total_salidas || prov['Cantidad Salidas'] || 0),
  }))
  crearYFinalizar('Por Proveedor', filas, `INVENTEX_Proveedores_${fechaActual()}.xlsx`)
}
