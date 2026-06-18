const INTENCIONES = [
  {
    id: 'stock_critico',
    patrones: [
      { texto: 'stock bajo', peso: 10 },
      { texto: 'stock critico', peso: 10 },
      { texto: 'que reponer', peso: 8 },
      { texto: 'que comprar', peso: 8 },
      { texto: 'falta stock', peso: 7 },
      { texto: 'se esta acabando', peso: 7 },
      { texto: 'reabastecer', peso: 9 },
      { texto: 'reponer', peso: 8 },
    ],
    handler: 'handleStockCritico',
  },
  {
    id: 'valor_inventario',
    patrones: [
      { texto: 'valor del inventario', peso: 10 },
      { texto: 'cuanto vale', peso: 9 },
      { texto: 'capital invertido', peso: 9 },
      { texto: 'valor total', peso: 8 },
      { texto: 'cuanto tengo invertido', peso: 9 },
    ],
    handler: 'handleValorInventario',
  },
  {
    id: 'consulta_producto_especifico',
    patrones: [
      { texto: 'cuanto stock tiene', peso: 9 },
      { texto: 'cuantas unidades', peso: 8 },
      { texto: 'informacion de', peso: 6 },
      { texto: 'dime sobre', peso: 6 },
      { texto: 'busca el producto', peso: 8 },
      { texto: 'stock de', peso: 7 },
      { texto: 'stock del', peso: 7 },
      { texto: 'stock', peso: 4 },
    ],
    handler: 'handleConsultaProducto',
  },
  {
    id: 'prediccion_agotamiento',
    patrones: [
      { texto: 'cuando se agota', peso: 10 },
      { texto: 'cuando se acaba', peso: 10 },
      { texto: 'va a agotar', peso: 9 },
      { texto: 'va a acabar', peso: 9 },
      { texto: 'se agote', peso: 8 },
      { texto: 'cuando comprar', peso: 9 },
      { texto: 'dias de stock', peso: 9 },
      { texto: 'cuanto durara', peso: 8 },
    ],
    handler: 'handlePrediccionAgotamiento',
  },
  {
    id: 'movimientos_recientes',
    patrones: [
      { texto: 'movimientos de hoy', peso: 10 },
      { texto: 'que entro', peso: 8 },
      { texto: 'que salio', peso: 8 },
      { texto: 'ultimas entradas', peso: 8 },
      { texto: 'ultimas salidas', peso: 8 },
      { texto: 'historial reciente', peso: 7 },
    ],
    handler: 'handleMovimientosRecientes',
  },
  {
    id: 'analisis_categoria',
    patrones: [
      { texto: 'productos de la categoria', peso: 9 },
      { texto: 'que hay en', peso: 5 },
      { texto: 'categoria de', peso: 6 },
    ],
    handler: 'handleAnalisisCategoria',
  },
  {
    id: 'analisis_proveedor',
    patrones: [
      { texto: 'productos del proveedor', peso: 9 },
      { texto: 'que nos vende', peso: 7 },
      { texto: 'proveedor', peso: 5 },
    ],
    handler: 'handleAnalisisProveedor',
  },
  {
    id: 'resumen_general',
    patrones: [
      { texto: 'analiza el inventario', peso: 10 },
      { texto: 'resumen general', peso: 9 },
      { texto: 'como esta el inventario', peso: 9 },
      { texto: 'dame un resumen', peso: 8 },
      { texto: 'estado general', peso: 8 },
    ],
    handler: 'handleResumenGeneral',
  },
  {
    id: 'saludo',
    patrones: [
      { texto: 'hola', peso: 10 },
      { texto: 'buenos dias', peso: 10 },
      { texto: 'buenas tardes', peso: 10 },
      { texto: 'que tal', peso: 8 },
    ],
    handler: 'handleSaludo',
  },
]

function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

export function clasificarIntencion(mensaje) {
  const textoNormalizado = normalizar(mensaje)

  let mejorIntencion = null
  let mejorPuntaje = 0

  for (const intencion of INTENCIONES) {
    let puntaje = 0
    for (const patron of intencion.patrones) {
      const patronNormalizado = normalizar(patron.texto)
      if (textoNormalizado.includes(patronNormalizado)) {
        puntaje += patron.peso
      }
    }
    if (puntaje > mejorPuntaje) {
      mejorPuntaje = puntaje
      mejorIntencion = intencion
    }
  }

  if (mejorPuntaje < 5) {
    return { intencion: 'desconocida', confianza: 0 }
  }

  return {
    intencion: mejorIntencion.id,
    handler: mejorIntencion.handler,
    confianza: mejorPuntaje,
  }
}
