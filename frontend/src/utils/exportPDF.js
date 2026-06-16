import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const agregarEncabezadoPDF = (doc, titulo, subtitulo, esLandscape = false) => {
  const anchoTotal = esLandscape ? 297 : 210;
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, anchoTotal, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('INVENTEX', 14, 12);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Sistema ERP de Inventario', 14, 18);

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(titulo, anchoTotal - 14, 12, { align: 'right' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(subtitulo, anchoTotal - 14, 18, { align: 'right' });

  const ahora = new Date().toLocaleString('es-PE');
  doc.setFontSize(7);
  doc.setTextColor(200, 220, 255);
  doc.text(`Generado: ${ahora}`, anchoTotal - 14, 24, { align: 'right' });

  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.3);
  doc.line(14, 26, anchoTotal - 14, 26);
};

const agregarPiePagina = (doc) => {
  const totalPaginas = doc.internal.getNumberOfPages();
  const anchoTotal = doc.internal.pageSize.width;
  const alturaPag = doc.internal.pageSize.height;

  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    doc.setFillColor(245, 247, 250);
    doc.rect(0, alturaPag - 12, anchoTotal, 12, 'F');
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('INVENTEX — Sistema ERP de Inventario', 14, alturaPag - 5);
    doc.text(`Página ${i} de ${totalPaginas}`, anchoTotal - 14, alturaPag - 5, { align: 'right' });
  }
};

const formatearFechaPDF = () => {
  const hoy = new Date();
  return `${hoy.getDate().toString().padStart(2, '0')}-${(hoy.getMonth() + 1).toString().padStart(2, '0')}-${hoy.getFullYear()}`;
};

export const exportarMovimientosPDF = (data) => {
  if (!data || data.length === 0) return false;
  const doc = new jsPDF({ orientation: 'landscape' });
  agregarEncabezadoPDF(doc, 'Reporte de Movimientos', 'Entradas y salidas de inventario', true);

  const entradas = data.filter(m => m.tipo === 'entrada').reduce((s, m) => s + m.cantidad, 0);
  const salidas = data.filter(m => m.tipo === 'salida').reduce((s, m) => s + m.cantidad, 0);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total registros: ${data.length}`, 14, 35);
  doc.setTextColor(34, 197, 94);
  doc.text(`Entradas: ${entradas} uds`, 70, 35);
  doc.setTextColor(239, 68, 68);
  doc.text(`Salidas: ${salidas} uds`, 130, 35);

  autoTable(doc, {
    startY: 40,
    head: [['Fecha/Hora', 'Producto', 'Código', 'Tipo', 'Cantidad', 'Stock Ant.', 'Stock Nuevo', 'Motivo', 'Usuario']],
    body: data.map(m => [
      m.created_at ? new Date(m.created_at).toLocaleString('es-PE') : '',
      m.productos?.nombre || m.producto_nombre || '',
      m.productos?.codigo || m.producto_codigo || '',
      m.tipo === 'entrada' ? 'Entrada' : 'Salida',
      m.cantidad,
      m.stock_anterior,
      m.stock_nuevo,
      m.motivo || '',
      m.usuarios?.nombre_completo || m.usuario_nombre || '',
    ]),
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold', fontSize: 8, halign: 'center' },
    bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: { 3: { fontStyle: 'bold', halign: 'center' }, 4: { halign: 'center' }, 5: { halign: 'center' }, 6: { halign: 'center' } },
    didDrawCell: (cellData) => {
      if (cellData.column.index === 3 && cellData.section === 'body') {
        const tipo = cellData.cell.text[0];
        doc.setTextColor(tipo === 'Entrada' ? 34 : 239, tipo === 'Entrada' ? 197 : 68, tipo === 'Entrada' ? 94 : 68);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.text(tipo, cellData.cell.x + cellData.cell.width / 2, cellData.cell.y + cellData.cell.height / 2 + 1, { align: 'center' });
      }
    },
    margin: { left: 14, right: 14 },
    tableLineColor: [226, 232, 240],
    tableLineWidth: 0.1,
  });

  agregarPiePagina(doc);
  doc.save(`INVENTEX_Movimientos_${formatearFechaPDF()}.pdf`);
  return true;
};

export const exportarInventarioPDF = (data) => {
  if (!data || data.length === 0) return false;
  const doc = new jsPDF({ orientation: 'landscape' });
  agregarEncabezadoPDF(doc, 'Inventario Actual', 'Stock completo de productos', true);

  const totalValor = data.reduce((s, p) => s + (p.stock_actual * p.precio_compra), 0);
  const sinStock = data.filter(p => p.stock_actual === 0).length;
  const stockBajo = data.filter(p => p.stock_actual > 0 && p.stock_actual <= p.stock_minimo).length;

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total productos: ${data.length}`, 14, 35);
  doc.setTextColor(239, 68, 68);
  doc.text(`Sin stock: ${sinStock}`, 70, 35);
  doc.setTextColor(245, 158, 11);
  doc.text(`Stock bajo: ${stockBajo}`, 110, 35);
  doc.setTextColor(34, 197, 94);
  doc.text(`Valor total: S/. ${totalValor.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`, 150, 35);

  autoTable(doc, {
    startY: 40,
    head: [['Código', 'Nombre', 'Categoría', 'Stock', 'Mínimo', 'Estado', 'P. Compra', 'P. Venta', 'Valor Stock']],
    body: data.map(p => {
      const estado = p.stock_actual === 0 ? 'Sin stock' : p.stock_actual <= p.stock_minimo ? 'Stock bajo' : 'Disponible';
      return [
        p.codigo, p.nombre, p.categorias?.nombre || '', p.stock_actual, p.stock_minimo, estado,
        `S/. ${Number(p.precio_compra).toFixed(2)}`, `S/. ${Number(p.precio_venta).toFixed(2)}`,
        `S/. ${(p.stock_actual * p.precio_compra).toFixed(2)}`
      ];
    }),
    foot: [['', 'TOTAL GENERAL', '', data.reduce((s, p) => s + p.stock_actual, 0), '', '', '', '', `S/. ${totalValor.toFixed(2)}`]],
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    footStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: { 3: { halign: 'center' }, 4: { halign: 'center' }, 5: { halign: 'center', fontStyle: 'bold' }, 6: { halign: 'right' }, 7: { halign: 'right' }, 8: { halign: 'right', fontStyle: 'bold' } },
    margin: { left: 14, right: 14 },
    tableLineColor: [226, 232, 240],
    tableLineWidth: 0.1,
  });

  agregarPiePagina(doc);
  doc.save(`INVENTEX_Inventario_${formatearFechaPDF()}.pdf`);
  return true;
};

export const exportarStockBajoPDF = (data) => {
  if (!data || data.length === 0) return false;
  const doc = new jsPDF({ orientation: 'portrait' });
  agregarEncabezadoPDF(doc, 'Alerta de Stock Bajo', 'Productos que requieren reposición', false);

  doc.setFillColor(254, 243, 199);
  doc.roundedRect(14, 32, 182, 10, 2, 2, 'F');
  doc.setTextColor(146, 64, 14);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`⚠  ${data.length} productos requieren reposición inmediata`, 105, 38.5, { align: 'center' });

  const ordenados = [...data].sort((a, b) => (b.stock_minimo - b.stock_actual) - (a.stock_minimo - a.stock_actual));

  autoTable(doc, {
    startY: 46,
    head: [['Código', 'Nombre', 'Categoría', 'Stock Actual', 'Stock Mínimo', 'Faltante', 'Unidad', 'Proveedor']],
    body: ordenados.map(p => [
      p.codigo, p.nombre, p.categorias?.nombre || '', p.stock_actual, p.stock_minimo,
      p.stock_minimo - p.stock_actual, p.unidad_medida, p.proveedores?.nombre || ''
    ]),
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [255, 251, 235] },
    columnStyles: { 3: { halign: 'center', textColor: [239, 68, 68], fontStyle: 'bold' }, 4: { halign: 'center' }, 5: { halign: 'center', textColor: [239, 68, 68], fontStyle: 'bold' }, 6: { halign: 'center' } },
    margin: { left: 14, right: 14 },
    tableLineColor: [226, 232, 240],
    tableLineWidth: 0.1,
  });

  agregarPiePagina(doc);
  doc.save(`INVENTEX_StockBajo_${formatearFechaPDF()}.pdf`);
  return true;
};
