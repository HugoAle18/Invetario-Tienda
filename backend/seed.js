import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'


const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const CATEGORIAS = [
  { nombre: 'Electrónica', descripcion: 'Dispositivos electrónicos y accesorios' },
  { nombre: 'Ropa y Accesorios', descripcion: 'Prendas de vestir y complementos' },
  { nombre: 'Alimentos y Bebidas', descripcion: 'Productos alimenticios y bebidas' },
  { nombre: 'Herramientas', descripcion: 'Herramientas y ferretería' },
  { nombre: 'Hogar', descripcion: 'Artículos para el hogar y decoración' },
  { nombre: 'Salud y Belleza', descripcion: 'Productos de cuidado personal' },
  { nombre: 'Equipamiento Deportivo', descripcion: 'Artículos y accesorios deportivos' },
  { nombre: 'Artículos de Escritorio', descripcion: 'Útiles y accesorios de oficina' },
]

const PROVEEDORES = [
  { nombre: 'Distribuidora ABC', contacto: 'Carlos Mendoza', telefono: '999111000', email: 'carlos@abc.com', direccion: 'Av. Principal 123, Lima' },
  { nombre: 'Importadora del Sur', contacto: 'María López', telefono: '999222111', email: 'maria@delsur.com', direccion: 'Jr. Las Flores 456, Arequipa' },
  { nombre: 'Comercial Norte', contacto: 'Pedro García', telefono: '999333222', email: 'pedro@norte.com', direccion: 'Calle Real 789, Trujillo' },
  { nombre: 'Proveedora XYZ', contacto: 'Ana Torres', telefono: '999444333', email: 'ana@xyz.com', direccion: 'Av. Central 321, Cusco' },
  { nombre: 'Grupo Importex', contacto: 'Luis Vega', telefono: '999555444', email: 'luis@importex.com', direccion: 'Jr. Comercio 654, Piura' },
  { nombre: 'Mayorista El Sol', contacto: 'Rosa Díaz', telefono: '999666555', email: 'rosa@elsol.com', direccion: 'Av. Sol 987, Chiclayo' },
  { nombre: 'Distribuciones Perú', contacto: 'Jorge Ríos', telefono: '999777666', email: 'jorge@peru.com', direccion: 'Jr. Unión 147, Huancayo' },
  { nombre: 'Proveedora del Centro', contacto: 'Carmen Silva', telefono: '999888777', email: 'carmen@centro.com', direccion: 'Av. Central 258, Iquitos' },
]

const PRODUCTOS = [
  // Electrónica (cat 0)
  { codigo: 'ELE-001', nombre: 'mouse', descripcion: 'Mouse óptico inalámbrico', precio_compra: 15.00, precio_venta: 40.00, stock_actual: 47, stock_minimo: 10, unidad_medida: 'unidad', categoria_idx: 0, proveedor_idx: 0 },
  { codigo: 'ELE-002', nombre: 'Cargador USB-C 65W', descripcion: 'Cargador rápido para laptops y tablets', precio_compra: 22.00, precio_venta: 45.00, stock_actual: 30, stock_minimo: 15, unidad_medida: 'unidad', categoria_idx: 0, proveedor_idx: 1 },
  { codigo: 'ELE-003', nombre: 'Teclado Mecánico RGB', descripcion: 'Teclado mecánico gaming con switches Cherry MX', precio_compra: 55.00, precio_venta: 120.00, stock_actual: 0, stock_minimo: 5, unidad_medida: 'unidad', categoria_idx: 0, proveedor_idx: 0 },
  { codigo: 'ELE-004', nombre: 'Monitor 27" 4K', descripcion: 'Monitor IPS 4K UHD para diseño profesional', precio_compra: 280.00, precio_venta: 520.00, stock_actual: 8, stock_minimo: 3, unidad_medida: 'unidad', categoria_idx: 0, proveedor_idx: 2 },
  { codigo: 'ELE-005', nombre: 'Webcam HD 1080p', descripcion: 'Cámara web con micrófono integrado', precio_compra: 25.00, precio_venta: 59.90, stock_actual: 20, stock_minimo: 10, unidad_medida: 'unidad', categoria_idx: 0, proveedor_idx: 1 },

  // Ropa y Accesorios (cat 1)
  { codigo: 'ROP-001', nombre: 'Zapatillas Running', descripcion: 'Zapatillas deportivas con amortiguación', precio_compra: 55.00, precio_venta: 150.00, stock_actual: 2, stock_minimo: 10, unidad_medida: 'unidad', categoria_idx: 6, proveedor_idx: 5 },
  { codigo: 'ROP-002', nombre: 'Camiseta Algodón Premium', descripcion: 'Camiseta de manga corta 100% algodón orgánico', precio_compra: 12.00, precio_venta: 35.00, stock_actual: 100, stock_minimo: 30, unidad_medida: 'unidad', categoria_idx: 1, proveedor_idx: 3 },
  { codigo: 'ROP-003', nombre: 'Chaqueta Impermeable', descripcion: 'Chaqueta con membrana impermeable y transpirable', precio_compra: 45.00, precio_venta: 120.00, stock_actual: 15, stock_minimo: 8, unidad_medida: 'unidad', categoria_idx: 1, proveedor_idx: 4 },
  { codigo: 'ROP-004', nombre: 'Jeans Clásico', descripcion: 'Pantalón jeans de corte recto', precio_compra: 28.00, precio_venta: 79.90, stock_actual: 40, stock_minimo: 15, unidad_medida: 'unidad', categoria_idx: 1, proveedor_idx: 3 },

  // Alimentos y Bebidas (cat 2)
  { codigo: 'ALI-001', nombre: 'Café Orgánico 500g', descripcion: 'Café molido 100% orgánico de altura', precio_compra: 18.00, precio_venta: 38.00, stock_actual: 60, stock_minimo: 20, unidad_medida: 'kg', categoria_idx: 2, proveedor_idx: 6 },
  { codigo: 'ALI-002', nombre: 'Aceite de Oliva Extra 1L', descripcion: 'Aceite de oliva virgen extra', precio_compra: 25.00, precio_venta: 55.00, stock_actual: 25, stock_minimo: 10, unidad_medida: 'litro', categoria_idx: 2, proveedor_idx: 6 },
  { codigo: 'ALI-003', nombre: 'Chocolate Artesanal 200g', descripcion: 'Chocolate negro 70% cacao artesanal', precio_compra: 8.50, precio_venta: 22.00, stock_actual: 80, stock_minimo: 25, unidad_medida: 'unidad', categoria_idx: 2, proveedor_idx: 7 },
  { codigo: 'ALI-004', nombre: 'Agua Mineral 2L', descripcion: 'Agua mineral natural sin gas', precio_compra: 1.50, precio_venta: 4.50, stock_actual: 200, stock_minimo: 50, unidad_medida: 'unidad', categoria_idx: 2, proveedor_idx: 7 },

  // Artículos de Escritorio (cat 7)
  { codigo: 'HER-001', nombre: 'Lámpara LED Escritorio', descripcion: 'Lámpara con luz LED regulable y USB', precio_compra: 20.00, precio_venta: 49.90, stock_actual: 18, stock_minimo: 8, unidad_medida: 'unidad', categoria_idx: 7, proveedor_idx: 0 },
  { codigo: 'HER-002', nombre: 'Organizador de Escritorio', descripcion: 'Organizador múltiple de bambú', precio_compra: 15.00, precio_venta: 38.00, stock_actual: 5, stock_minimo: 10, unidad_medida: 'unidad', categoria_idx: 7, proveedor_idx: 2 },

  // Hogar (cat 4)
  { codigo: 'HOG-001', nombre: 'Cojín Decorativo 45cm', descripcion: 'Cojín de felpa suave para sala', precio_compra: 10.00, precio_venta: 28.00, stock_actual: 35, stock_minimo: 12, unidad_medida: 'unidad', categoria_idx: 4, proveedor_idx: 3 },

  // Salud y Belleza (cat 5)
  { codigo: 'SAL-001', nombre: 'Crema Hidratante 250ml', descripcion: 'Crema corporal con aloe vera y vitamina E', precio_compra: 9.00, precio_venta: 24.90, stock_actual: 45, stock_minimo: 15, unidad_medida: 'unidad', categoria_idx: 5, proveedor_idx: 5 },
  { codigo: 'SAL-002', nombre: 'Protector Solar SPF50', descripcion: 'Protector solar facial resistente al agua', precio_compra: 14.00, precio_venta: 35.00, stock_actual: 12, stock_minimo: 10, unidad_medida: 'unidad', categoria_idx: 5, proveedor_idx: 5 },
  { codigo: 'SAL-003', nombre: 'Shampoo Natural 500ml', descripcion: 'Shampoo con keratina y aceites naturales', precio_compra: 11.00, precio_venta: 29.00, stock_actual: 0, stock_minimo: 10, unidad_medida: 'unidad', categoria_idx: 5, proveedor_idx: 4 },
]

const MOVIMIENTOS_BASE = [
  { tipo: 'entrada', cantidad: 30, motivo: 'Compra inicial' },
  { tipo: 'entrada', cantidad: 50, motivo: 'Compra inicial' },
  { tipo: 'entrada', cantidad: 20, motivo: 'Compra inicial' },
  { tipo: 'entrada', cantidad: 100, motivo: 'Compra inicial' },
  { tipo: 'entrada', cantidad: 15, motivo: 'Compra inicial' },
  { tipo: 'salida', cantidad: 5, motivo: 'Venta mostrador' },
  { tipo: 'salida', cantidad: 3, motivo: 'Venta online' },
  { tipo: 'salida', cantidad: 8, motivo: 'Venta corporativa' },
  { tipo: 'salida', cantidad: 2, motivo: 'Venta mostrador' },
  { tipo: 'salida', cantidad: 10, motivo: 'Venta online' },
  { tipo: 'entrada', cantidad: 25, motivo: 'Reabastecimiento semanal' },
  { tipo: 'entrada', cantidad: 40, motivo: 'Reabastecimiento semanal' },
  { tipo: 'salida', cantidad: 12, motivo: 'Venta mostrador' },
  { tipo: 'salida', cantidad: 6, motivo: 'Venta online' },
  { tipo: 'entrada', cantidad: 10, motivo: 'Devolución cliente' },
  { tipo: 'salida', cantidad: 15, motivo: 'Venta corporativa' },
  { tipo: 'entrada', cantidad: 60, motivo: 'Compra mensual' },
  { tipo: 'entrada', cantidad: 35, motivo: 'Compra mensual' },
  { tipo: 'salida', cantidad: 7, motivo: 'Venta mostrador' },
  { tipo: 'salida', cantidad: 4, motivo: 'Venta online' },
]

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(randomInt(8, 18), randomInt(0, 59), randomInt(0, 59))
  return d.toISOString()
}

async function seed() {
  console.log('🌱 Iniciando seed de INVENTEX...\n')

  // 1. Verificar si ya hay datos
  const { count } = await supabase.from('categorias').select('*', { count: 'exact', head: true })
  if (count > 0) {
    console.log('⚠️  La base de datos ya tiene datos. Eliminando existentes...')
    await supabase.from('movimientos').delete().neq('id', 0)
    await supabase.from('productos').delete().neq('id', 0)
    await supabase.from('proveedores').delete().neq('id', 0)
    await supabase.from('categorias').delete().neq('id', 0)
    await supabase.from('usuarios').delete().neq('id', 0)
    console.log('✅ Datos anteriores eliminados.\n')
  }

  // 2. Categorías
  const { data: cats, error: errCat } = await supabase.from('categorias').insert(CATEGORIAS).select()
  if (errCat) throw new Error(`Categorías: ${errCat.message}`)
  console.log(`✅ ${cats.length} categorías creadas`)

  // 3. Proveedores
  const { data: provs, error: errProv } = await supabase.from('proveedores').insert(PROVEEDORES).select()
  if (errProv) throw new Error(`Proveedores: ${errProv.message}`)
  console.log(`✅ ${provs.length} proveedores creados`)

  // 4. Usuario admin por defecto
  const passwordHash = await bcrypt.hash('admin123', 10)
  const { data: users, error: errUser } = await supabase.from('usuarios').insert({
    nombre: 'Admin Principal',
    email: 'admin@inventex.com',
    password: passwordHash,
    rol: 'administrador',
    activo: true,
  }).select()
  if (errUser) throw new Error(`Usuario admin: ${errUser.message}`)
  console.log(`✅ Usuario admin creado: admin@inventex.com / admin123`)

  // 5. Usuario empleado
  const empPass = await bcrypt.hash('empleado123', 10)
  const { data: empUser, error: errEmp } = await supabase.from('usuarios').insert({
    nombre: 'Empleado Demo',
    email: 'empleado@inventex.com',
    password: empPass,
    rol: 'empleado',
    activo: true,
  }).select()
  if (errEmp) throw new Error(`Usuario empleado: ${errEmp.message}`)
  console.log(`✅ Usuario empleado creado: empleado@inventex.com / empleado123`)

  // 6. Productos (mapear índices a IDs reales)
  const productosData = PRODUCTOS.map(p => ({
    codigo: p.codigo,
    nombre: p.nombre,
    descripcion: p.descripcion,
    precio_compra: p.precio_compra,
    precio_venta: p.precio_venta,
    stock_minimo: p.stock_minimo,
    stock_actual: p.stock_actual,
    categoria_id: cats[p.categoria_idx].id,
    proveedor_id: provs[p.proveedor_idx].id,
    activo: true,
  }))

  const { data: prods, error: errProd } = await supabase.from('productos').insert(productosData).select()
  if (errProd) throw new Error(`Productos: ${errProd.message}`)
  console.log(`✅ ${prods.length} productos creados`)

  // 7. Movimientos (distribuidos en los últimos 30 días)
  const movimientosData = []
  let movIdx = 0
  for (const prod of prods) {
    const baseCount = randomInt(2, 5)
    for (let i = 0; i < baseCount; i++) {
      const base = MOVIMIENTOS_BASE[movIdx % MOVIMIENTOS_BASE.length]
      movimientosData.push({
        producto_id: prod.id,
        usuario_id: users[0].id,
        tipo: base.tipo,
        cantidad: base.cantidad,
        motivo: base.motivo,
        stock_anterior: 0,
        stock_nuevo: 0,
        created_at: daysAgo(randomInt(1, 28)),
      })
      movIdx++
    }
  }

  const { error: errMov } = await supabase.from('movimientos').insert(movimientosData)
  if (errMov) throw new Error(`Movimientos: ${errMov.message}`)
  console.log(`✅ ${movimientosData.length} movimientos creados`)

  // 8. Resumen
  console.log('\n═══════════════════════════════════════')
  console.log('🚀  SEED COMPLETADO EXITOSAMENTE')
  console.log('═══════════════════════════════════════')
  console.log(`   Categorías:    ${cats.length}`)
  console.log(`   Proveedores:   ${provs.length}`)
  console.log(`   Productos:     ${prods.length}`)
  console.log(`   Movimientos:   ${movimientosData.length}`)
  console.log(`   Usuarios:      2`)
  console.log('')
  console.log('   🔑 Admin:     admin@inventex.com / admin123')
  console.log('   🔑 Empleado:  empleado@inventex.com / empleado123')
  console.log('═══════════════════════════════════════\n')
}

seed().catch(err => {
  console.error('\n❌ Error durante el seed:', err.message)
  process.exit(1)
})
