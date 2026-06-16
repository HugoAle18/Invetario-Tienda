-- ============================================================
-- INVENTEX — SCRIPT DE SEED (Ejecutar en Supabase SQL Editor)
-- ============================================================
-- 1. Ir a: https://supabase.com/dashboard/project/jcyqgdoytvbmmrtzvlai/sql/new
-- 2. Pegar este script y ejecutar
-- 3. Credenciales de acceso:
--    Admin:    admin@inventex.com / Admin123!
--    Empleado: empleado@inventex.com / Empleado123!
-- ============================================================

-- LIMPIAR DATOS EXISTENTES (en orden inverso por FK)
DELETE FROM movimientos;
DELETE FROM productos;
DELETE FROM proveedores;
DELETE FROM categorias;
DELETE FROM usuarios;

-- ============================================================
-- 1. CATEGORÍAS
-- ============================================================
INSERT INTO categorias (nombre, descripcion) VALUES
  ('Electrónica',     'Dispositivos electrónicos y accesorios'),
  ('Ropa y Accesorios', 'Prendas de vestir y complementos'),
  ('Alimentos y Bebidas', 'Productos alimenticios y bebidas'),
  ('Hogar y Muebles', 'Artículos para el hogar y mobiliario'),
  ('Salud y Belleza', 'Productos de cuidado personal'),
  ('Deportes',        'Artículos deportivos y recreación'),
  ('Juguetes',        'Juegos y juguetes'),
  ('Papelería',       'Útiles escolares y de oficina'),
  ('Herramientas',    'Herramientas y ferretería'),
  ('Automotriz',      'Partes y accesorios para vehículos');

-- ============================================================
-- 2. PROVEEDORES
-- ============================================================
INSERT INTO proveedores (nombre, contacto, telefono, email, direccion) VALUES
  ('Distribuidora ABC',   'Carlos Mendoza', '999111000', 'carlos@abc.com',     'Av. Principal 123, Lima'),
  ('Importadora del Sur', 'María López',    '999222111', 'maria@delsur.com',   'Jr. Las Flores 456, Arequipa'),
  ('Comercial Norte',     'Pedro García',   '999333222', 'pedro@norte.com',    'Calle Real 789, Trujillo'),
  ('Proveedora XYZ',      'Ana Torres',     '999444333', 'ana@xyz.com',        'Av. Central 321, Cusco'),
  ('Grupo Importex',      'Luis Vega',      '999555444', 'luis@importex.com',  'Jr. Comercio 654, Piura'),
  ('Mayorista El Sol',    'Rosa Díaz',      '999666555', 'rosa@elsol.com',     'Av. Sol 987, Chiclayo'),
  ('Distribuciones Perú', 'Jorge Ríos',     '999777666', 'jorge@peru.com',     'Jr. Unión 147, Huancayo'),
  ('Proveedora del Centro','Carmen Silva',  '999888777', 'carmen@centro.com',  'Av. Central 258, Iquitos');

-- ============================================================
-- 3. USUARIOS (passwords con bcrypt via pgcrypto)
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO usuarios (nombre, email, password, rol, activo) VALUES
  ('Admin Principal', 'admin@inventex.com',    crypt('Admin123!',    gen_salt('bf')), 'administrador', true),
  ('Empleado Demo',   'empleado@inventex.com', crypt('Empleado123!', gen_salt('bf')), 'empleado',      true);

-- ============================================================
-- 4. PRODUCTOS
-- ============================================================
-- NOTA: Los IDs de categorías y proveedores pueden variar.
-- Si la tabla no estaba vacía, ajustar los id_categoria / id_proveedor.
-- ============================================================
DO $$
DECLARE
  cat RECORD; prov RECORD;
  cat_ids  TEXT[]; prov_ids TEXT[];
BEGIN
  -- Mapear nombres a IDs
  cat_ids  := ARRAY(SELECT id::TEXT FROM categorias ORDER BY id);
  prov_ids := ARRAY(SELECT id::TEXT FROM proveedores ORDER BY id);

  INSERT INTO productos (codigo, nombre, descripcion, precio_compra, precio_venta, stock_actual, stock_minimo, categoria_id, proveedor_id, activo) VALUES
  -- Electrónica (cat 1 → cat_ids[1])
  ('ELE-001', 'Auriculares Bluetooth Pro',     'Auriculares inalámbricos con cancelación de ruido',          45.00,  89.90,  50, 10, cat_ids[1]::UUID, prov_ids[1]::UUID, true),
  ('ELE-002', 'Cargador USB-C 65W',            'Cargador rápido para laptops y tablets',                    22.00,  45.00,  30, 15, cat_ids[1]::UUID, prov_ids[2]::UUID, true),
  ('ELE-003', 'Teclado Mecánico RGB',          'Teclado mecánico gaming con switches Cherry MX',             55.00, 120.00,   0,  5, cat_ids[1]::UUID, prov_ids[1]::UUID, true),
  ('ELE-004', 'Monitor 27" 4K',                'Monitor IPS 4K UHD para diseño profesional',                280.00, 520.00,   8,  3, cat_ids[1]::UUID, prov_ids[3]::UUID, true),
  ('ELE-005', 'Webcam HD 1080p',               'Cámara web con micrófono integrado',                         25.00,  59.90,  20, 10, cat_ids[1]::UUID, prov_ids[2]::UUID, true),

  -- Ropa (cat 2 → cat_ids[2])
  ('ROP-001', 'Camiseta Algodón Premium',      'Camiseta de manga corta 100% algodón orgánico',              12.00,  35.00, 100, 30, cat_ids[2]::UUID, prov_ids[4]::UUID, true),
  ('ROP-002', 'Chaqueta Impermeable',           'Chaqueta con membrana impermeable y transpirable',           45.00, 120.00,  15,  8, cat_ids[2]::UUID, prov_ids[5]::UUID, true),
  ('ROP-003', 'Jeans Clásico',                 'Pantalón jeans de corte recto',                              28.00,  79.90,  40, 15, cat_ids[2]::UUID, prov_ids[4]::UUID, true),
  ('ROP-004', 'Zapatillas Running',            'Zapatillas deportivas con amortiguación',                    55.00, 150.00,   2, 10, cat_ids[2]::UUID, prov_ids[6]::UUID, true),

  -- Alimentos (cat 3 → cat_ids[3])
  ('ALI-001', 'Café Orgánico 500g',            'Café molido 100% orgánico de altura',                        18.00,  38.00,  60, 20, cat_ids[3]::UUID, prov_ids[7]::UUID, true),
  ('ALI-002', 'Aceite de Oliva Extra 1L',      'Aceite de oliva virgen extra',                              25.00,  55.00,  25, 10, cat_ids[3]::UUID, prov_ids[7]::UUID, true),
  ('ALI-003', 'Chocolate Artesanal 200g',      'Chocolate negro 70% cacao artesanal',                        8.50,  22.00,  80, 25, cat_ids[3]::UUID, prov_ids[8]::UUID, true),
  ('ALI-004', 'Agua Mineral 2L',               'Agua mineral natural sin gas',                               1.50,   4.50, 200, 50, cat_ids[3]::UUID, prov_ids[8]::UUID, true),

  -- Hogar (cat 4 → cat_ids[4])
  ('HOG-001', 'Lámpara LED Escritorio',        'Lámpara con luz LED regulable y USB',                        20.00,  49.90,  18,  8, cat_ids[4]::UUID, prov_ids[1]::UUID, true),
  ('HOG-002', 'Organizador de Escritorio',     'Organizador múltiple de bambú',                             15.00,  38.00,   5, 10, cat_ids[4]::UUID, prov_ids[3]::UUID, true),
  ('HOG-003', 'Cojín Decorativo 45cm',         'Cojín de felpa suave para sala',                            10.00,  28.00,  35, 12, cat_ids[4]::UUID, prov_ids[4]::UUID, true),

  -- Salud (cat 5 → cat_ids[5])
  ('SAL-001', 'Crema Hidratante 250ml',        'Crema corporal con aloe vera y vitamina E',                   9.00,  24.90,  45, 15, cat_ids[5]::UUID, prov_ids[6]::UUID, true),
  ('SAL-002', 'Protector Solar SPF50',         'Protector solar facial resistente al agua',                  14.00,  35.00,  12, 10, cat_ids[5]::UUID, prov_ids[6]::UUID, true),
  ('SAL-003', 'Shampoo Natural 500ml',         'Shampoo con keratina y aceites naturales',                   11.00,  29.00,   0, 10, cat_ids[5]::UUID, prov_ids[5]::UUID, true),

  -- Deportes (cat 6 → cat_ids[6])
  ('DEP-001', 'Yoga Mat 6mm',                  'Colchoneta de yoga con alineación grabada',                  16.00,  42.00,  22,  8, cat_ids[6]::UUID, prov_ids[6]::UUID, true),
  ('DEP-002', 'Pesas 2x5kg',                   'Set de pesas de neopreno',                                  30.00,  69.90,  10,  5, cat_ids[6]::UUID, prov_ids[3]::UUID, true),
  ('DEP-003', 'Cuerda para Saltar',            'Cuerda de velocidad ajustable con rodamientos',               5.00,  15.00,  50, 20, cat_ids[6]::UUID, prov_ids[1]::UUID, true),

  -- Papelería (cat 8 → cat_ids[8])
  ('PAP-001', 'Cuaderno A5 Rayado',            'Cuaderno tapa dura con 200 hojas',                           3.50,   9.90, 150, 40, cat_ids[8]::UUID, prov_ids[7]::UUID, true),
  ('PAP-002', 'Bolígrafo Gel 0.7mm',           'Bolígrafo de gel borrable',                                  1.20,   4.50, 300, 50, cat_ids[8]::UUID, prov_ids[7]::UUID, true),
  ('PAP-003', 'Mochila Ejecutiva 15.6"',       'Mochila para laptop con puerto USB',                         22.00,  59.00,   0,  5, cat_ids[8]::UUID, prov_ids[2]::UUID, true);

END $$;

-- ============================================================
-- 5. MOVIMIENTOS (distribuidos en los últimos 30 días)
-- ============================================================
DO $$
DECLARE
  prod_ids  UUID[]; user_id UUID;
  tipos     TEXT[] := ARRAY['entrada', 'salida'];
  motivos_entrada TEXT[] := ARRAY['Compra inicial', 'Reabastecimiento semanal', 'Compra mensual', 'Devolución cliente'];
  motivos_salida  TEXT[] := ARRAY['Venta mostrador', 'Venta online', 'Venta corporativa'];
  cantidades_entrada INT[] := ARRAY[10, 15, 20, 25, 30, 35, 40, 50, 60, 100];
  cantidades_salida  INT[] := ARRAY[2, 3, 4, 5, 6, 7, 8, 10, 12, 15];
  i INT; t TEXT; prod_id UUID; cant INT; mot TEXT; dias INT; ts TIMESTAMP;
BEGIN
  prod_ids := ARRAY(SELECT id FROM productos ORDER BY id);
  SELECT id INTO user_id FROM usuarios WHERE rol = 'administrador' LIMIT 1;

  FOR i IN 1..array_length(prod_ids, 1) LOOP
    -- 2 a 5 movimientos por producto
    FOR j IN 1..(3 + (random() * 3)::INT) LOOP
      prod_id := prod_ids[i];

      IF random() < 0.55 THEN
        t := 'entrada';
        cant := cantidades_entrada[1 + (random() * (array_length(cantidades_entrada, 1) - 1))::INT];
        mot := motivos_entrada[1 + (random() * (array_length(motivos_entrada, 1) - 1))::INT];
      ELSE
        t := 'salida';
        cant := cantidades_salida[1 + (random() * (array_length(cantidades_salida, 1) - 1))::INT];
        mot := motivos_salida[1 + (random() * (array_length(motivos_salida, 1) - 1))::INT];
      END IF;

      dias := 1 + (random() * 29)::INT;
      ts := NOW() - (dias || ' days')::INTERVAL
            + (random() * 10)::INT * INTERVAL '1 hour'
            + (random() * 59)::INT * INTERVAL '1 minute';

      INSERT INTO movimientos (producto_id, usuario_id, tipo, cantidad, motivo, created_at)
      VALUES (prod_id, user_id, t, cant, mot, ts);
    END LOOP;
  END LOOP;
END $$;

-- ============================================================
-- 6. VERIFICACIÓN
-- ============================================================
SELECT '✅ Categorías:'   AS item, COUNT(*) FROM categorias
UNION ALL
SELECT '✅ Proveedores:', COUNT(*) FROM proveedores
UNION ALL
SELECT '✅ Productos:',   COUNT(*) FROM productos
UNION ALL
SELECT '✅ Usuarios:',    COUNT(*) FROM usuarios
UNION ALL
SELECT '✅ Movimientos:', COUNT(*) FROM movimientos;

-- ============================================================
-- CORREGIR CONTRASEÑAS (si ya ejecutaste el seed anterior)
-- ============================================================
UPDATE usuarios SET password = crypt('Admin123!', gen_salt('bf'))    WHERE email = 'admin@inventex.com';
UPDATE usuarios SET password = crypt('Empleado123!', gen_salt('bf')) WHERE email = 'empleado@inventex.com';

-- ============================================================
-- CREDENCIALES DE ACCESO
-- ============================================================
--   Admin:    admin@inventex.com / Admin123!
--   Empleado: empleado@inventex.com / Empleado123!
-- ============================================================
