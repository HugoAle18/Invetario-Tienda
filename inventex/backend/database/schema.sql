-- ============================================================
-- INVENTEX — Esquema de Base de Datos (Supabase / PostgreSQL)
-- ================================================ by anomalyco ==
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- 1. EXTENSIONES
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLAS
-- ============================================================

-- 2.1. usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  password    TEXT NOT NULL,
  rol         TEXT NOT NULL CHECK (rol IN ('administrador', 'empleado')),
  activo      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.2. categorias
CREATE TABLE IF NOT EXISTS categorias (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      TEXT NOT NULL UNIQUE,
  descripcion TEXT DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.3. proveedores
CREATE TABLE IF NOT EXISTS proveedores (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      TEXT NOT NULL,
  contacto    TEXT DEFAULT '',
  telefono    TEXT DEFAULT '',
  email       TEXT DEFAULT '',
  direccion   TEXT DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.4. productos
CREATE TABLE IF NOT EXISTS productos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo        TEXT NOT NULL UNIQUE,
  nombre        TEXT NOT NULL,
  descripcion   TEXT DEFAULT '',
  categoria_id  UUID REFERENCES categorias(id) ON DELETE SET NULL,
  proveedor_id  UUID REFERENCES proveedores(id) ON DELETE SET NULL,
  precio_compra NUMERIC(12,2) NOT NULL DEFAULT 0,
  precio_venta  NUMERIC(12,2) NOT NULL DEFAULT 0,
  stock_minimo  INTEGER NOT NULL DEFAULT 0,
  stock_actual  INTEGER NOT NULL DEFAULT 0,
  imagen_url    TEXT DEFAULT '',
  activo        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.5. movimientos (entradas / salidas)
CREATE TABLE IF NOT EXISTS movimientos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id     UUID NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
  tipo            TEXT NOT NULL CHECK (tipo IN ('entrada', 'salida')),
  cantidad        INTEGER NOT NULL CHECK (cantidad > 0),
  motivo          TEXT NOT NULL DEFAULT '',
  precio_unitario NUMERIC(12,2),
  usuario_id      UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.6. refresh_tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id  UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token       TEXT NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_productos_categoria   ON productos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_productos_proveedor   ON productos(proveedor_id);
CREATE INDEX IF NOT EXISTS idx_productos_codigo      ON productos(codigo);
CREATE INDEX IF NOT EXISTS idx_movimientos_producto  ON movimientos(producto_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_usuario   ON movimientos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_tipo      ON movimientos(tipo);
CREATE INDEX IF NOT EXISTS idx_movimientos_creado    ON movimientos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_refresh_token         ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_usuarios_email        ON usuarios(email);

-- 4. TRIGGER: actualizar updated_at automáticamente
-- ============================================================

CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY['usuarios', 'categorias', 'proveedores', 'productos'])
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger
      WHERE tgname = 'trg_' || tbl || '_updated_at'
    ) THEN
      EXECUTE format(
        'CREATE TRIGGER trg_%I_updated_at
         BEFORE UPDATE ON %I
         FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at()',
        tbl, tbl
      );
    END IF;
  END LOOP;
END;
$$;

-- 5. RPC — registrar_entrada
-- ============================================================

CREATE OR REPLACE FUNCTION registrar_entrada(
  p_producto_id     UUID,
  p_cantidad        INTEGER,
  p_motivo          TEXT,
  p_precio_unitario NUMERIC,
  p_usuario_id      UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_producto TEXT;
BEGIN
  -- Validar producto
  SELECT nombre INTO v_producto
  FROM productos
  WHERE id = p_producto_id AND activo = TRUE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('exito', FALSE, 'error', 'Producto no encontrado o desactivado');
  END IF;

  -- Validar cantidad
  IF p_cantidad <= 0 THEN
    RETURN jsonb_build_object('exito', FALSE, 'error', 'La cantidad debe ser mayor a cero');
  END IF;

  -- Insertar movimiento
  INSERT INTO movimientos (producto_id, tipo, cantidad, motivo, precio_unitario, usuario_id)
  VALUES (p_producto_id, 'entrada', p_cantidad, p_motivo, p_precio_unitario, p_usuario_id);

  -- Actualizar stock
  UPDATE productos
  SET stock_actual = stock_actual + p_cantidad
  WHERE id = p_producto_id;

  RETURN jsonb_build_object('exito', TRUE, 'mensaje', 'Entrada registrada correctamente');
END;
$$;

-- 6. RPC — registrar_salida
-- ============================================================

CREATE OR REPLACE FUNCTION registrar_salida(
  p_producto_id UUID,
  p_cantidad    INTEGER,
  p_motivo      TEXT,
  p_usuario_id  UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stock     INTEGER;
  v_producto  TEXT;
BEGIN
  -- Validar producto
  SELECT nombre, stock_actual INTO v_producto, v_stock
  FROM productos
  WHERE id = p_producto_id AND activo = TRUE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('exito', FALSE, 'error', 'Producto no encontrado o desactivado');
  END IF;

  -- Validar cantidad
  IF p_cantidad <= 0 THEN
    RETURN jsonb_build_object('exito', FALSE, 'error', 'La cantidad debe ser mayor a cero');
  END IF;

  -- Validar stock suficiente
  IF v_stock < p_cantidad THEN
    RETURN jsonb_build_object(
      'exito', FALSE,
      'error', format('Stock insuficiente. Disponible: %s, solicitado: %s', v_stock, p_cantidad)
    );
  END IF;

  -- Insertar movimiento (precio_unitario se obtiene del producto automáticamente)
  INSERT INTO movimientos (producto_id, tipo, cantidad, motivo, precio_unitario, usuario_id)
  VALUES (p_producto_id, 'salida', p_cantidad, p_motivo,
    (SELECT precio_venta FROM productos WHERE id = p_producto_id),
    p_usuario_id);

  -- Actualizar stock
  UPDATE productos
  SET stock_actual = stock_actual - p_cantidad
  WHERE id = p_producto_id;

  RETURN jsonb_build_object('exito', TRUE, 'mensaje', 'Salida registrada correctamente');
END;
$$;

-- 7. RPC — obtener_alertas_stock
-- ============================================================

CREATE OR REPLACE FUNCTION obtener_alertas_stock()
RETURNS TABLE (
  id          UUID,
  codigo      TEXT,
  nombre      TEXT,
  stock_actual INTEGER,
  stock_minimo INTEGER,
  diferencia  INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.codigo,
    p.nombre,
    p.stock_actual,
    p.stock_minimo,
    (p.stock_actual - p.stock_minimo) AS diferencia
  FROM productos p
  WHERE p.activo = TRUE
    AND p.stock_actual <= p.stock_minimo
  ORDER BY diferencia ASC;
END;
$$;

-- 8. RPC — obtener_dashboard_admin
-- Devuelve KPIs para el panel de administración
-- ============================================================

CREATE OR REPLACE FUNCTION obtener_dashboard_admin()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_productos  INTEGER;
  v_total_categorias INTEGER;
  v_total_proveedores INTEGER;
  v_total_movimientos INTEGER;
  v_total_usuarios    INTEGER;
  v_valor_inventario  NUMERIC;
  v_productos_bajo_stock INTEGER;
  v_resultado JSONB;
BEGIN
  SELECT COUNT(*) INTO v_total_productos FROM productos WHERE activo = TRUE;
  SELECT COUNT(*) INTO v_total_categorias FROM categorias;
  SELECT COUNT(*) INTO v_total_proveedores FROM proveedores;
  SELECT COUNT(*) INTO v_total_movimientos FROM movimientos WHERE created_at >= NOW() - INTERVAL '30 days';
  SELECT COUNT(*) INTO v_total_usuarios FROM usuarios WHERE activo = TRUE;
  SELECT COALESCE(SUM(precio_compra * stock_actual), 0) INTO v_valor_inventario FROM productos WHERE activo = TRUE;
  SELECT COUNT(*) INTO v_productos_bajo_stock FROM productos WHERE activo = TRUE AND stock_actual <= stock_minimo;

  v_resultado := jsonb_build_object(
    'total_productos',       v_total_productos,
    'total_categorias',      v_total_categorias,
    'total_proveedores',     v_total_proveedores,
    'total_movimientos_30d', v_total_movimientos,
    'total_usuarios',        v_total_usuarios,
    'valor_inventario',      v_valor_inventario,
    'productos_bajo_stock',  v_productos_bajo_stock
  );

  RETURN v_resultado;
END;
$$;

-- 9. RPC — obtener_movimientos_recientes
-- ============================================================

CREATE OR REPLACE FUNCTION obtener_movimientos_recientes(
  p_limite INTEGER DEFAULT 20
)
RETURNS TABLE (
  id          UUID,
  tipo        TEXT,
  cantidad    INTEGER,
  motivo      TEXT,
  producto    TEXT,
  usuario     TEXT,
  created_at  TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.tipo,
    m.cantidad,
    m.motivo,
    p.nombre AS producto,
    u.nombre AS usuario,
    m.created_at
  FROM movimientos m
  JOIN productos p ON p.id = m.producto_id
  JOIN usuarios u ON u.id = m.usuario_id
  ORDER BY m.created_at DESC
  LIMIT p_limite;
END;
$$;

-- 10. DATOS INICIALES (opcional)
-- ============================================================
-- IMPORTANTE: Reemplazar los password_hash ejecutando primero:
--   node backend/scripts/generarHash.js
-- Luego copiar los hashes generados en los INSERT de abajo.
-- ============================================================

-- 10.1. Usuarios por defecto
-- INSERT INTO usuarios (nombre, email, password, rol) VALUES
--   ('Administrador', 'admin@inventex.com', 'REEMPLAZAR_CON_HASH_ADMIN', 'administrador'),
--   ('Empleado Demo', 'empleado@inventex.com', 'REEMPLAZAR_CON_HASH_EMPLEADO', 'empleado');

-- 10.2. Categorías iniciales
-- INSERT INTO categorias (nombre, descripcion) VALUES
--   ('Electrónicos', 'Productos electrónicos y tecnología'),
--   ('Ropa y Accesorios', 'Prendas de vestir y accesorios'),
--   ('Alimentos y Bebidas', 'Productos alimenticios y bebidas'),
--   ('Hogar', 'Artículos para el hogar'),
--   ('Oficina', 'Útiles y mobiliario de oficina');

-- 10.3. Proveedores iniciales
-- INSERT INTO proveedores (nombre, contacto, telefono) VALUES
--   ('Distribuidora General S.A.', 'Carlos López', '555-0101'),
--   ('Importaciones del Sur', 'María García', '555-0102'),
--   ('Proveedor Local', 'Juan Pérez', '555-0103');
