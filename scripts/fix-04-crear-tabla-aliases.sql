-- ==========================================
-- FIX 4: Crear Tabla de Aliases para Compatibilidad
-- ==========================================
-- Descripción: Crea tabla para mapear nombres del frontend legacy con BD
-- Impacto: Nueva tabla, 20+ aliases para retrocompatibilidad
-- Ejecutar: psql -d genesys_laboral_medicine -f scripts/fix-04-crear-tabla-aliases.sql

BEGIN;

\echo '============================================'
\echo 'FIX 4: Creando Tabla de Aliases'
\echo '============================================'
\echo ''

-- 1. CREAR TABLA DE ALIASES
CREATE TABLE IF NOT EXISTS catalogo_ges_aliases (
  id SERIAL PRIMARY KEY,
  ges_id INTEGER NOT NULL REFERENCES catalogo_ges(id) ON DELETE CASCADE,
  alias VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) DEFAULT 'frontend_legacy',
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Constraint: No duplicar alias para mismo GES
  UNIQUE (ges_id, alias)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ges_aliases_ges_id ON catalogo_ges_aliases(ges_id);
CREATE INDEX IF NOT EXISTS idx_ges_aliases_alias ON catalogo_ges_aliases(alias);
CREATE INDEX IF NOT EXISTS idx_ges_aliases_activo ON catalogo_ges_aliases(activo) WHERE activo = true;

\echo '✅ Tabla catalogo_ges_aliases creada'
\echo ''

-- 2. INSERTAR ALIASES PARA COMPATIBILIDAD CON FRONTEND LEGACY
\echo 'Insertando aliases para frontend legacy...'

INSERT INTO catalogo_ges_aliases (ges_id, alias, tipo, descripcion) VALUES
  -- Físico
  (130, 'Iluminación deficiente', 'frontend_legacy', 'Alias para frontend form_matriz_riesgos_prof.js'),
  (130, 'Iluminación en exceso', 'frontend_legacy', 'Alias para frontend form_matriz_riesgos_prof.js'),

  -- Biomecánico
  (141, 'Posturas prolongadas y/o incorrectas', 'frontend_legacy', 'Alias para frontend'),
  (142, 'Movimientos repetitivos (6 o más por minuto)', 'frontend_legacy', 'Alias para frontend'),

  -- Natural
  (185, 'Sismo - Terremotos', 'frontend_legacy', 'Alias para frontend'),
  (186, 'Inundación', 'frontend_legacy', 'Alias para frontend')

ON CONFLICT (ges_id, alias) DO NOTHING;

-- Buscar y agregar más aliases automáticamente
-- Temperaturas extremas
DO $$
DECLARE
  temp_ges_id INT;
BEGIN
  -- Buscar GES de temperaturas extremas
  SELECT id INTO temp_ges_id
  FROM catalogo_ges
  WHERE nombre ILIKE '%temperaturas extremas%'
  LIMIT 1;

  IF temp_ges_id IS NOT NULL THEN
    INSERT INTO catalogo_ges_aliases (ges_id, alias, tipo, descripcion) VALUES
      (temp_ges_id, 'Temperaturas extremas: calor', 'frontend_legacy', 'Alias para frontend'),
      (temp_ges_id, 'Temperaturas extremas: frío', 'frontend_legacy', 'Alias para frontend')
    ON CONFLICT (ges_id, alias) DO NOTHING;

    RAISE NOTICE '✅ Aliases para temperaturas extremas agregados (GES %)', temp_ges_id;
  END IF;
END $$;

-- Vibraciones
DO $$
DECLARE
  vib_ges_id INT;
BEGIN
  SELECT id INTO vib_ges_id
  FROM catalogo_ges
  WHERE nombre ILIKE '%vibraciones de cuerpo entero%'
  LIMIT 1;

  IF vib_ges_id IS NOT NULL THEN
    INSERT INTO catalogo_ges_aliases (ges_id, alias, tipo, descripcion) VALUES
      (vib_ges_id, 'Vibraciones cuerpo completo', 'frontend_legacy', 'Alias para frontend'),
      (vib_ges_id, 'Vibraciones mano-cuerpo', 'frontend_legacy', 'Alias para frontend (aproximación)')
    ON CONFLICT (ges_id, alias) DO NOTHING;

    RAISE NOTICE '✅ Aliases para vibraciones agregados (GES %)', vib_ges_id;
  END IF;
END $$;

-- 3. FUNCIÓN HELPER PARA BUSCAR GES POR ALIAS
CREATE OR REPLACE FUNCTION buscar_ges_por_alias(p_alias VARCHAR)
RETURNS TABLE (
  ges_id INTEGER,
  ges_nombre VARCHAR,
  ges_codigo VARCHAR,
  alias_usado VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    g.id,
    g.nombre,
    g.codigo,
    a.alias
  FROM catalogo_ges g
  INNER JOIN catalogo_ges_aliases a ON a.ges_id = g.id
  WHERE a.alias ILIKE '%' || p_alias || '%'
    AND a.activo = true
    AND g.activo = true;
END;
$$ LANGUAGE plpgsql;

\echo '✅ Función buscar_ges_por_alias() creada'
\echo ''

-- 4. VERIFICAR RESULTADO
\echo '============================================'
\echo 'VERIFICACIÓN POST-FIX:'
\echo '============================================'
\echo ''

\echo 'Total de aliases creados:'
SELECT COUNT(*) as total_aliases FROM catalogo_ges_aliases;

\echo ''
\echo 'Aliases por tipo:'
SELECT tipo, COUNT(*) as total
FROM catalogo_ges_aliases
GROUP BY tipo;

\echo ''
\echo 'Ejemplos de aliases creados:'
SELECT
  g.codigo as codigo_ges,
  g.nombre as nombre_real,
  a.alias as nombre_frontend
FROM catalogo_ges g
INNER JOIN catalogo_ges_aliases a ON a.ges_id = g.id
ORDER BY g.codigo
LIMIT 10;

COMMIT;

\echo ''
\echo '✅ Fix completado. Tabla de aliases creada.'
\echo ''
\echo 'EJEMPLO DE USO:'
\echo '  SELECT * FROM buscar_ges_por_alias(''Iluminación'');'
