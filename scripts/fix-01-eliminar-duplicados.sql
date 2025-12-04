-- ==========================================
-- FIX 1: Eliminar Duplicados de GES
-- ==========================================
-- Descripción: Elimina 24 GES duplicados, manteniendo solo el registro con menor ID
-- Impacto: 24 filas eliminadas
-- Ejecutar: psql -d genesys_laboral_medicine -f scripts/fix-01-eliminar-duplicados.sql

BEGIN;

-- 1. LISTAR DUPLICADOS ANTES DE ELIMINAR (para auditoría)
CREATE TEMP TABLE temp_duplicados AS
SELECT nombre, STRING_AGG(id::TEXT, ', ' ORDER BY id) as ids, COUNT(*) as total
FROM catalogo_ges
WHERE activo = true
GROUP BY nombre
HAVING COUNT(*) > 1
ORDER BY total DESC;

\echo '============================================'
\echo 'DUPLICADOS DETECTADOS (antes de fix):'
\echo '============================================'
SELECT * FROM temp_duplicados;

\echo ''
\echo 'Total de GES duplicados: '
SELECT SUM(total - 1) as ges_a_eliminar FROM temp_duplicados;

-- 2. ELIMINAR DUPLICADOS (mantener el de menor ID)
WITH duplicates AS (
  SELECT id, nombre,
    ROW_NUMBER() OVER (PARTITION BY nombre ORDER BY id) as rn
  FROM catalogo_ges
  WHERE activo = true
)
DELETE FROM catalogo_ges
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- 3. VERIFICAR RESULTADO
\echo ''
\echo '============================================'
\echo 'VERIFICACIÓN POST-FIX:'
\echo '============================================'

SELECT nombre, COUNT(*) as total
FROM catalogo_ges
WHERE activo = true
GROUP BY nombre
HAVING COUNT(*) > 1;

\echo ''
\echo 'Si no aparece ninguna fila arriba, los duplicados fueron eliminados correctamente.'
\echo ''

-- 4. MOSTRAR ESTADÍSTICAS FINALES
SELECT COUNT(*) as total_ges_activos FROM catalogo_ges WHERE activo = true;

COMMIT;

\echo ''
\echo '✅ Fix completado. Duplicados eliminados.'
