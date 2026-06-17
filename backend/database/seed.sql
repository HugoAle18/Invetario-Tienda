-- ============================================================
-- INVENTEX — Seed Data (categorias, proveedores, productos)
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

BEGIN;

-- 1. Limpiar datos existentes (orden inverso de dependencias)
TRUNCATE TABLE movimientos CASCADE;
TRUNCATE TABLE productos CASCADE;
TRUNCATE TABLE proveedores CASCADE;
TRUNCATE TABLE categorias CASCADE;

-- 2. Categorías (8 oficiales)
INSERT INTO categorias (nombre, descripcion) VALUES
  ('Electrónica',           'Dispositivos electrónicos y accesorios'),
  ('Ropa y Accesorios',     'Prendas de vestir y complementos'),
  ('Alimentos y Bebidas',   'Productos alimenticios y bebidas'),
  ('Herramientas',          'Herramientas y ferretería'),
  ('Hogar y Muebles',       'Artículos para el hogar y decoración'),
  ('Salud y Belleza',       'Productos de cuidado personal'),
  ('Deportes',              'Artículos y accesorios deportivos'),
  ('Artículos de Escritorio','Útiles y accesorios de oficina');

-- 3. Proveedores (8)
INSERT INTO proveedores (nombre, contacto, telefono, email, direccion) VALUES
  ('Distribuidora ABC',   'Carlos Mendoza', '999111000', 'carlos@abc.com',     'Av. Principal 123, Lima'),
  ('Importadora del Sur', 'María López',    '999222111', 'maria@delsur.com',   'Jr. Las Flores 456, Arequipa'),
  ('Comercial Norte',     'Pedro García',   '999333222', 'pedro@norte.com',    'Calle Real 789, Trujillo'),
  ('Proveedora XYZ',      'Ana Torres',     '999444333', 'ana@xyz.com',        'Av. Central 321, Cusco'),
  ('Grupo Importex',      'Luis Vega',      '999555444', 'luis@importex.com',  'Jr. Comercio 654, Piura'),
  ('Mayorista El Sol',    'Rosa Díaz',      '999666555', 'rosa@elsol.com',     'Av. Sol 987, Chiclayo'),
  ('Distribuciones Perú', 'Jorge Ríos',     '999777666', 'jorge@peru.com',     'Jr. Unión 147, Huancayo'),
  ('Proveedora del Centro','Carmen Silva',  '999888777', 'carmen@centro.com',  'Av. Central 258, Iquitos');

-- 4. Usuarios por defecto (solo si no existen)
INSERT INTO usuarios (nombre, email, password, rol)
SELECT 'Admin Principal', 'admin@inventex.com', crypt('admin123', gen_salt('bf')), 'administrador'
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'admin@inventex.com');

INSERT INTO usuarios (nombre, email, password, rol)
SELECT 'Empleado Demo', 'empleado@inventex.com', crypt('empleado123', gen_salt('bf')), 'empleado'
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'empleado@inventex.com');

-- 5. Productos (20)
INSERT INTO productos (codigo, nombre, descripcion, precio_compra, precio_venta, stock_minimo, stock_actual, categoria_id, proveedor_id, activo) VALUES

-- Electrónica
('ELE-001', 'mouse',                   'Mouse óptico inalámbrico',                        15.00, 40.00,  10, 47, (SELECT id FROM categorias WHERE nombre='Electrónica'),            (SELECT id FROM proveedores WHERE nombre='Distribuidora ABC'),   true),
('ELE-002', 'Cargador USB-C 65W',     'Cargador rápido para laptops y tablets',           22.00, 45.00,  15, 30, (SELECT id FROM categorias WHERE nombre='Electrónica'),            (SELECT id FROM proveedores WHERE nombre='Importadora del Sur'), true),
('ELE-003', 'Teclado Mecánico RGB',   'Teclado mecánico gaming con switches Cherry MX',   55.00, 120.00, 5,  0,  (SELECT id FROM categorias WHERE nombre='Electrónica'),            (SELECT id FROM proveedores WHERE nombre='Distribuidora ABC'),   true),
('ELE-004', 'Monitor 27" 4K',         'Monitor IPS 4K UHD para diseño profesional',        280.00,520.00, 3,  8,  (SELECT id FROM categorias WHERE nombre='Electrónica'),            (SELECT id FROM proveedores WHERE nombre='Comercial Norte'),     true),
('ELE-005', 'Webcam HD 1080p',        'Cámara web con micrófono integrado',               25.00, 59.90,  10, 20, (SELECT id FROM categorias WHERE nombre='Electrónica'),            (SELECT id FROM proveedores WHERE nombre='Importadora del Sur'), true),

-- Ropa y Accesorios
('ROP-001', 'Zapatillas Running',      'Zapatillas deportivas con amortiguación',          55.00, 150.00, 10, 2,  (SELECT id FROM categorias WHERE nombre='Ropa y Accesorios'),      (SELECT id FROM proveedores WHERE nombre='Mayorista El Sol'),    true),
('ROP-002', 'Camiseta Algodón Premium','Camiseta de manga corta 100% algodón orgánico',    12.00, 35.00,  30, 100,(SELECT id FROM categorias WHERE nombre='Ropa y Accesorios'),      (SELECT id FROM proveedores WHERE nombre='Proveedora XYZ'),      true),
('ROP-003', 'Chaqueta Impermeable',    'Chaqueta con membrana impermeable y transpirable', 45.00, 120.00, 8,  15, (SELECT id FROM categorias WHERE nombre='Ropa y Accesorios'),      (SELECT id FROM proveedores WHERE nombre='Grupo Importex'),      true),
('ROP-004', 'Jeans Clásico',           'Pantalón jeans de corte recto',                    28.00, 79.90,  15, 40, (SELECT id FROM categorias WHERE nombre='Ropa y Accesorios'),      (SELECT id FROM proveedores WHERE nombre='Proveedora XYZ'),      true),

-- Alimentos y Bebidas
('ALI-001', 'Café Orgánico 500g',      'Café molido 100% orgánico de altura',              18.00, 38.00,  20, 60, (SELECT id FROM categorias WHERE nombre='Alimentos y Bebidas'),    (SELECT id FROM proveedores WHERE nombre='Distribuciones Perú'), true),
('ALI-002', 'Aceite de Oliva Extra 1L','Aceite de oliva virgen extra',                    25.00, 55.00,  10, 25, (SELECT id FROM categorias WHERE nombre='Alimentos y Bebidas'),    (SELECT id FROM proveedores WHERE nombre='Distribuciones Perú'), true),
('ALI-003', 'Chocolate Artesanal 200g','Chocolate negro 70% cacao artesanal',              8.50, 22.00,  25, 80, (SELECT id FROM categorias WHERE nombre='Alimentos y Bebidas'),    (SELECT id FROM proveedores WHERE nombre='Proveedora del Centro'),true),
('ALI-004', 'Agua Mineral 2L',         'Agua mineral natural sin gas',                     1.50, 4.50,   50, 200,(SELECT id FROM categorias WHERE nombre='Alimentos y Bebidas'),    (SELECT id FROM proveedores WHERE nombre='Proveedora del Centro'),true),

-- Artículos de Escritorio
('HER-001', 'Lámpara LED Escritorio',  'Lámpara con luz LED regulable y USB',              20.00, 49.90,  8,  18, (SELECT id FROM categorias WHERE nombre='Artículos de Escritorio'),(SELECT id FROM proveedores WHERE nombre='Distribuidora ABC'),   true),
('HER-002', 'Organizador de Escritorio','Organizador múltiple de bambú',                    15.00, 38.00,  10, 5,  (SELECT id FROM categorias WHERE nombre='Artículos de Escritorio'),(SELECT id FROM proveedores WHERE nombre='Comercial Norte'),     true),

-- Hogar y Muebles
('HOG-001', 'Cojín Decorativo 45cm',   'Cojín de felpa suave para sala',                  10.00, 28.00,  12, 35, (SELECT id FROM categorias WHERE nombre='Hogar y Muebles'),       (SELECT id FROM proveedores WHERE nombre='Proveedora XYZ'),      true),

-- Salud y Belleza
('SAL-001', 'Crema Hidratante 250ml',  'Crema corporal con aloe vera y vitamina E',        9.00, 24.90,  15, 45, (SELECT id FROM categorias WHERE nombre='Salud y Belleza'),       (SELECT id FROM proveedores WHERE nombre='Mayorista El Sol'),    true),
('SAL-002', 'Protector Solar SPF50',   'Protector solar facial resistente al agua',        14.00, 35.00,  10, 12, (SELECT id FROM categorias WHERE nombre='Salud y Belleza'),       (SELECT id FROM proveedores WHERE nombre='Mayorista El Sol'),    true),
('SAL-003', 'Shampoo Natural 500ml',   'Shampoo con keratina y aceites naturales',         11.00, 29.00,  10, 0,  (SELECT id FROM categorias WHERE nombre='Salud y Belleza'),       (SELECT id FROM proveedores WHERE nombre='Grupo Importex'),      true),

-- Deportes
('DEP-001', 'Yoga Mat 6mm',            'Mat de yoga antideslizante de 6mm de grosor',      25.00, 65.00,  10, 30, (SELECT id FROM categorias WHERE nombre='Deportes'),              (SELECT id FROM proveedores WHERE nombre='Grupo Importex'),      true);

COMMIT;
