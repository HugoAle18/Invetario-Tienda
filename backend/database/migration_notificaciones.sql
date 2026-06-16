-- ============================================================
-- MIGRACIÓN: Sistema de Notificaciones Automáticas
-- Crea la tabla `notificaciones` y un trigger sobre `movimientos`
-- ============================================================

CREATE TABLE IF NOT EXISTS notificaciones (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id  UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo        TEXT NOT NULL CHECK (tipo IN ('entrada', 'salida', 'alerta', 'sistema')),
  titulo      TEXT NOT NULL,
  descripcion TEXT NOT NULL DEFAULT '',
  leida       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones(usuario_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notificaciones_no_leidas ON notificaciones(usuario_id, leida) WHERE leida = FALSE;

-- ============================================================
-- TRIGGER: Crear notificación automática al insertar movimiento
-- ============================================================
CREATE OR REPLACE FUNCTION crear_notificacion_movimiento()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_producto_nombre TEXT;
  v_usuario_nombre  TEXT;
  v_titulo          TEXT;
  v_descripcion     TEXT;
BEGIN
  SELECT nombre INTO v_producto_nombre FROM productos WHERE id = NEW.producto_id;
  SELECT nombre INTO v_usuario_nombre  FROM usuarios  WHERE id = NEW.usuario_id;

  IF NEW.tipo = 'entrada' THEN
    v_titulo      := 'Entrada registrada: ' || v_producto_nombre;
    v_descripcion := 'Se añadieron ' || NEW.cantidad || ' unidades al inventario por ' || v_usuario_nombre || '.';
  ELSE
    v_titulo      := 'Salida registrada: ' || v_producto_nombre;
    v_descripcion := 'Se retiraron ' || NEW.cantidad || ' unidades. Motivo: ' || NEW.motivo || '. Stock actual: (consultar).';
  END IF;

  -- Notificar a todos los administradores
  INSERT INTO notificaciones (usuario_id, tipo, titulo, descripcion)
  SELECT id, NEW.tipo, v_titulo, v_descripcion
  FROM usuarios
  WHERE rol = 'administrador'
    AND id != NEW.usuario_id;

  -- Notificar al usuario que realizó el movimiento
  INSERT INTO notificaciones (usuario_id, tipo, titulo, descripcion)
  VALUES (NEW.usuario_id, NEW.tipo, v_titulo, v_descripcion);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_crear_notificacion_movimiento ON movimientos;

CREATE TRIGGER trg_crear_notificacion_movimiento
  AFTER INSERT ON movimientos
  FOR EACH ROW
  EXECUTE FUNCTION crear_notificacion_movimiento();
