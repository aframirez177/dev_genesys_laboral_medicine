-- ====================================================================
-- CORRECCIÓN DE CATÁLOGO DE RIESGOS
-- ====================================================================
-- Objetivo: Configurar correctamente las 14 categorías de riesgo
-- Fecha: 2025-11-12
-- ====================================================================

BEGIN;

-- ====================================================================
-- PASO 1: Actualizar nombres (quitar prefijo "Riesgo")
-- ====================================================================

UPDATE catalogo_riesgos SET nombre = 'Físico' WHERE codigo = 'RF';
UPDATE catalogo_riesgos SET nombre = 'Biomecánico' WHERE codigo = 'RB';
UPDATE catalogo_riesgos SET nombre = 'Químico' WHERE codigo = 'RQ';
UPDATE catalogo_riesgos SET nombre = 'Biológico' WHERE codigo = 'RBL';
UPDATE catalogo_riesgos SET nombre = 'Seguridad' WHERE codigo = 'CS';
UPDATE catalogo_riesgos SET nombre = 'Psicosocial' WHERE codigo = 'RPS';
UPDATE catalogo_riesgos SET nombre = 'Natural' WHERE codigo = 'RFN';

-- ====================================================================
-- PASO 2: Reasignar GES de RT (Riesgo Tecnológico) a CS (Seguridad)
-- ====================================================================

-- Primero, verificar cuántos GES tienen RT
DO $$
DECLARE
  ges_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO ges_count
  FROM catalogo_ges
  WHERE riesgo_id = (SELECT id FROM catalogo_riesgos WHERE codigo = 'RT');

  RAISE NOTICE 'GES asociados a RT (Riesgo Tecnológico): %', ges_count;
END $$;

-- Reasignar todos los GES de RT a CS
UPDATE catalogo_ges
SET riesgo_id = (SELECT id FROM catalogo_riesgos WHERE codigo = 'CS')
WHERE riesgo_id = (SELECT id FROM catalogo_riesgos WHERE codigo = 'RT');

-- Desactivar RT
UPDATE catalogo_riesgos SET activo = false WHERE codigo = 'RT';

-- ====================================================================
-- PASO 3: Insertar las 7 categorías faltantes
-- ====================================================================

-- 3.1 Mecánico (orden 11)
INSERT INTO catalogo_riesgos (codigo, nombre, activo, orden, created_at, updated_at)
VALUES ('MEC', 'Mecánico', true, 11, NOW(), NOW())
ON CONFLICT (codigo) DO UPDATE
SET nombre = EXCLUDED.nombre, activo = EXCLUDED.activo, orden = EXCLUDED.orden, updated_at = NOW();

-- 3.2 Eléctrico (orden 12)
INSERT INTO catalogo_riesgos (codigo, nombre, activo, orden, created_at, updated_at)
VALUES ('ELE', 'Eléctrico', true, 12, NOW(), NOW())
ON CONFLICT (codigo) DO UPDATE
SET nombre = EXCLUDED.nombre, activo = EXCLUDED.activo, orden = EXCLUDED.orden, updated_at = NOW();

-- 3.3 Factores Humanos (orden 13)
INSERT INTO catalogo_riesgos (codigo, nombre, activo, orden, created_at, updated_at)
VALUES ('FH', 'Factores Humanos', true, 13, NOW(), NOW())
ON CONFLICT (codigo) DO UPDATE
SET nombre = EXCLUDED.nombre, activo = EXCLUDED.activo, orden = EXCLUDED.orden, updated_at = NOW();

-- 3.4 Locativo (orden 14)
INSERT INTO catalogo_riesgos (codigo, nombre, activo, orden, created_at, updated_at)
VALUES ('LOC', 'Locativo', true, 14, NOW(), NOW())
ON CONFLICT (codigo) DO UPDATE
SET nombre = EXCLUDED.nombre, activo = EXCLUDED.activo, orden = EXCLUDED.orden, updated_at = NOW();

-- 3.5 Otros Riesgos (orden 15)
INSERT INTO catalogo_riesgos (codigo, nombre, activo, orden, created_at, updated_at)
VALUES ('OTR', 'Otros Riesgos', true, 15, NOW(), NOW())
ON CONFLICT (codigo) DO UPDATE
SET nombre = EXCLUDED.nombre, activo = EXCLUDED.activo, orden = EXCLUDED.orden, updated_at = NOW();

-- 3.6 Saneamiento Básico (orden 16)
INSERT INTO catalogo_riesgos (codigo, nombre, activo, orden, created_at, updated_at)
VALUES ('SAN', 'Saneamiento Básico', true, 16, NOW(), NOW())
ON CONFLICT (codigo) DO UPDATE
SET nombre = EXCLUDED.nombre, activo = EXCLUDED.activo, orden = EXCLUDED.orden, updated_at = NOW();

-- 3.7 Salud Pública (orden 17)
INSERT INTO catalogo_riesgos (codigo, nombre, activo, orden, created_at, updated_at)
VALUES ('SP', 'Salud Pública', true, 17, NOW(), NOW())
ON CONFLICT (codigo) DO UPDATE
SET nombre = EXCLUDED.nombre, activo = EXCLUDED.activo, orden = EXCLUDED.orden, updated_at = NOW();

-- ====================================================================
-- PASO 4: Reordenar las categorías existentes
-- ====================================================================

UPDATE catalogo_riesgos SET orden = 3 WHERE codigo = 'RF';   -- Físico
UPDATE catalogo_riesgos SET orden = 2 WHERE codigo = 'ELE';  -- Eléctrico
UPDATE catalogo_riesgos SET orden = 4 WHERE codigo = 'RQ';   -- Químico
UPDATE catalogo_riesgos SET orden = 5 WHERE codigo = 'RBL';  -- Biológico
UPDATE catalogo_riesgos SET orden = 6 WHERE codigo = 'RB';   -- Biomecánico
UPDATE catalogo_riesgos SET orden = 7 WHERE codigo = 'FH';   -- Factores Humanos
UPDATE catalogo_riesgos SET orden = 8 WHERE codigo = 'RPS';  -- Psicosocial
UPDATE catalogo_riesgos SET orden = 9 WHERE codigo = 'LOC';  -- Locativo
UPDATE catalogo_riesgos SET orden = 10 WHERE codigo = 'RFN'; -- Natural
UPDATE catalogo_riesgos SET orden = 11 WHERE codigo = 'CS';  -- Seguridad
UPDATE catalogo_riesgos SET orden = 12 WHERE codigo = 'OTR'; -- Otros Riesgos
UPDATE catalogo_riesgos SET orden = 13 WHERE codigo = 'SAN'; -- Saneamiento Básico
UPDATE catalogo_riesgos SET orden = 14 WHERE codigo = 'SP';  -- Salud Pública
UPDATE catalogo_riesgos SET orden = 1 WHERE codigo = 'MEC';  -- Mecánico

-- ====================================================================
-- VERIFICACIÓN FINAL
-- ====================================================================

DO $$
DECLARE
  activos_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO activos_count
  FROM catalogo_riesgos
  WHERE activo = true;

  IF activos_count = 14 THEN
    RAISE NOTICE '✅ ÉXITO: Se encontraron exactamente 14 categorías activas';
  ELSE
    RAISE WARNING '❌ ERROR: Se encontraron % categorías activas (esperadas: 14)', activos_count;
    RAISE EXCEPTION 'Verificación fallida: número incorrecto de categorías activas';
  END IF;
END $$;

COMMIT;

-- ====================================================================
-- REPORTE FINAL
-- ====================================================================

SELECT
  codigo,
  nombre,
  activo,
  orden,
  (SELECT COUNT(*) FROM catalogo_ges WHERE riesgo_id = catalogo_riesgos.id) as ges_count
FROM catalogo_riesgos
WHERE activo = true
ORDER BY orden;
