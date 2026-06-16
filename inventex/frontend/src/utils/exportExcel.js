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

function autoAncho(hojas) {
  for (const hoja of hojas) {
    if (!hoja.worksheet['!ref']) continue
    const rango = XLSX.utils.decode_range(hoja.worksheet['!ref'])
    const cols = []
    for (let c = rango.s.c; c <= rango.e.c; c++) {
      let maxLen = 10
      for (let r = rango.s.r; r <= rango.e.r; r++) {
        const celda = hoja.worksheet[XLSX.utils.encode_cell({ r, c })]
        if (celda && celda.v !== undefined && celda.v !== null) {
          maxLen = Math.max(maxLen, String(celda.v).length)
        }
      }
      cols.push({ wch: Math.min(maxLen + 4, 50) })
    }
    hoja.worksheet['!cols'] = cols
  }
}

function estiloEncabezados(worksheet, numCols) {
  const rango = XLSX.utils.decode_range(worksheet['!ref'])
  for (let c = 0; c <= rango.e.c; c++) {
    const ref = XLSX.utils.encode_cell({ r: 0, c })
    if (worksheet[ref]) {
      worksheet[ref].s = {
        fill: { fgColor: { rgb: '2563EB' } },
        font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
        alignment: { horizontal: 'center', vertical: 'center' },
      }
    }
  }
}

function estiloFilas(worksheet, numFilas) {
  for (let r = 1; r < numFilas; r++) {
    const color = r % 2 === 0 ? 'F8FAFC' : 'FFFFFF'
    for (let c = 0; c <= 20; c++) {
      const ref = XLSX.utils.encode_cell({ r, c })
      if (worksheet[ref]) {
        worksheet[ref].s = {
          ...worksheet[ref].s,
          fill: { fgColor: { rgb: color } },
          font: { ...worksheet[ref].s?.font, sz: 10 },
          alignment: { vertical: 'center' },
        }
      }
    }
  }
}

function crearLibro() {
  const wb = XLSX.utils.book_new()
  return wb
}

function finalizar(workbook, nombre) {
  for (let i = 0; i < workbook.SheetNames.length; i++) {
    const ws = workbook.Sheets[workbook.SheetNames[i]]
    const ref = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1')
    estiloEncabezados(ws, ref.e.c)
    estiloFilas(ws, ref.e.r + 1)
    ws['!freeze'] = { xSplit: 0, ySplit: 1 }
  }
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), nombre)
}

export function exportarMovimientos(data, filtros = {}) {
  if (!data || data.length === 0) return
  const wb = crearLibro()
  const filas = data.map((m) => ({
    Fecha: formatearFecha(m.created_at),
    Producto: m.productos?.nombre || m.producto || '',
    Código: m.productos?.codigo || '',
    Tipo: m.tipo === 'entrada' ? 'Entrada' : 'Salida',
    Cantidad: m.cantidad,
    Motivo: m.motivo || '',
    Usuario: m.usuarios?.nombre || m.usuario || '',
  }))
  const ws = XLSX.utils.json_to_sheet(filas)
  XLSX.utils.book_append_sheet(wb, ws, 'Movimientos')
  const sufijo = filtros.desde ? `_${filtros.desde}` : ''
  finalizar(wb, `INVENTEX_Movimientos${sufijo}_${fechaActual()}.xlsx`)
}

export function exportarInventario(data) {
  if (!data || data.length === 0) return
  const wb = crearLibro()
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
    Estado: '',
    'Precio Compra': '',
    'Precio Venta': '',
    'Valor en Stock': totalValor,
  })
  const ws = XLSX.utils.json_to_sheet(filas)
  XLSX.utils.book_append_sheet(wb, ws, 'Inventario Actual')
  finalizar(wb, `INVENTEX_Inventario_${fechaActual()}.xlsx`)
}

export function exportarProductosBajoMinimo(data) {
  if (!data || data.length === 0) return
  const wb = crearLibro()
  const ordenados = [...data]
    .filter((p) => p.stock_actual <= p.stock_minimo)
    .sort((a, b) => (a.stock_actual - a.stock_minimo) - (b.stock_actual - b.stock_minimo))
  const filas = ordenados.map((p) => ({
    Código: p.codigo,
    Nombre: p.nombre,
    Categoría: p.categorias?.nombre || '',
    'Stock Actual': p.stock_actual || 0,
    'Stock Mínimo': p.stock_minimo || 0,
    Diferencia: (p.stock_minimo || 0) - (p.stock_actual || 0),
    Proveedor: p.proveedores?.nombre || '',
  }))
  const ws = XLSX.utils.json_to_sheet(filas)
  XLSX.utils.book_append_sheet(wb, ws, 'Stock Bajo')
  finalizar(wb, `INVENTEX_StockBajo_${fechaActual()}.xlsx`)
}

export function exportarPorProveedor(data) {
  if (!data || data.length === 0) return
  const wb = crearLibro()
  const filas = data.map((prov) => ({
    Proveedor: prov.nombre,
    Producto: prov.producto || '',
    Código: prov.codigo || '',
    'Cantidad Entradas': prov.total_entradas || 0,
    'Cantidad Salidas': prov.total_salidas || 0,
    'Movimientos Totales': (prov.total_entradas || 0) + (prov.total_salidas || 0),
  }))
  const ws = XLSX.utils.json_to_sheet(filas)
  XLSX.utils.book_append_sheet(wb, ws, 'Por Proveedor')
  finalizar(wb, `INVENTEX_Proveedores_${fechaActual()}.xlsx`)
}
