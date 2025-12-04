-- ==================================================
-- VALIDACIÓN Y CORRECCIÓN DE CATÁLOGO GES
-- Script para verificar y agregar categorías faltantes
-- Autor: Claude Code (H3 - UX Audit Hallazgos)
-- Fecha: 11 de noviembre de 2025
-- ==================================================

-- ========================================
-- PASO 1: VERIFICAR CATEGORÍAS EXISTENTES
-- ========================================

SELECT
  'CATEGORÍAS EXISTENTES EN CATÁLOGO' as seccion;

SELECT
  tipo_riesgo,
  COUNT(*) as cantidad_ges,
  COUNT(CASE WHEN es_comun = true THEN 1 END) as comunes,
  COUNT(CASE WHEN es_comun = false THEN 1 END) as no_comunes
FROM catalogo_riesgos_ges
GROUP BY tipo_riesgo
ORDER BY cantidad_ges DESC;

-- ========================================
-- PASO 2: VERIFICAR CATEGORÍA "ELÉCTRICO"
-- ========================================

SELECT
  'VERIFICACIÓN ESPECÍFICA: RIESGO ELÉCTRICO' as seccion;

SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM catalogo_riesgos_ges WHERE tipo_riesgo = 'Eléctrico')
    THEN '✅ EXISTE - No se require acción'
    ELSE '❌ NO EXISTE - Se insertarán GES eléctricos'
  END as estado_electrico;

-- ========================================
-- PASO 3: INSERTAR GES ELÉCTRICOS (SI FALTA)
-- ========================================

-- Solo inserta si NO existe ningún GES con tipo_riesgo = 'Eléctrico'
INSERT INTO catalogo_riesgos_ges (
  nombre,
  descripcion,
  tipo_riesgo,
  es_comun,
  metadata,
  created_at,
  updated_at
)
SELECT
  'Contacto con energía eléctrica',
  'Riesgo de electrocución por contacto directo o indirecto con partes energizadas. Incluye contacto con conductores activos, equipos defectuosos, o fallas de aislamiento. Puede causar desde quemaduras leves hasta paro cardíaco.',
  'Eléctrico',
  true,
  jsonb_build_object(
    'examenes_medicos', jsonb_build_array('Electrocardiograma', 'Valoración médica general'),
    'controles_prioritarios', jsonb_build_array('LOTO (Lock Out Tag Out)', 'Pruebas de continuidad', 'EPP dieléctricos'),
    'fuente_legal', 'RETIE - Resolución 90708 de 2013'
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM catalogo_riesgos_ges WHERE tipo_riesgo = 'Eléctrico'
)
UNION ALL
SELECT
  'Arco eléctrico',
  'Riesgo de quemaduras graves por arco eléctrico durante maniobras, fallas o cortocircuitos. El arco puede alcanzar temperaturas superiores a 3000°C y generar proyección de partículas metálicas fundidas.',
  'Eléctrico',
  false,
  jsonb_build_object(
    'examenes_medicos', jsonb_build_array('Valoración de quemaduras', 'Oftalmología'),
    'controles_prioritarios', jsonb_build_array('Análisis de riesgos de arco', 'Ropa resistente al arco', 'Distancias de seguridad'),
    'nivel_tension', 'Media y Alta Tensión (>1000V)',
    'norma_aplicable', 'IEEE 1584 - Análisis de arco eléctrico'
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM catalogo_riesgos_ges WHERE tipo_riesgo = 'Eléctrico'
)
UNION ALL
SELECT
  'Electricidad estática',
  'Acumulación de cargas electrostáticas que pueden generar descargas eléctricas. Común en ambientes secos, manipulación de líquidos inflamables, o fricción con materiales sintéticos. Puede causar incendios en atmósferas explosivas.',
  'Eléctrico',
  false,
  jsonb_build_object(
    'examenes_medicos', jsonb_build_array('Valoración médica general'),
    'controles_prioritarios', jsonb_build_array('Puesta a tierra', 'Ionización del aire', 'Ropa conductiva', 'Control de humedad'),
    'ambientes_criticos', jsonb_build_array('Almacenes de químicos', 'Estaciones de servicio', 'Salas limpias'),
    'norma_aplicable', 'NFPA 77 - Prácticas recomendadas para electricidad estática'
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM catalogo_riesgos_ges WHERE tipo_riesgo = 'Eléctrico'
)
UNION ALL
SELECT
  'Trabajo en altura con riesgo eléctrico',
  'Combinación de riesgo de caída desde altura y exposición a líneas energizadas. Común en mantenimiento de redes eléctricas, postes, subestaciones y trabajos en estructuras metálicas cercanas a líneas de transmisión.',
  'Eléctrico',
  true,
  jsonb_build_object(
    'examenes_medicos', jsonb_build_array('Examen de alturas', 'Electrocardiograma', 'Visiometría'),
    'controles_prioritarios', jsonb_build_array('Doble protección anticaídas', 'Distancias de seguridad', 'Desenergización', 'Coordinación con operadores'),
    'certificaciones_requeridas', jsonb_build_array('Trabajo en alturas', 'Trabajo en líneas energizadas'),
    'fuente_legal', 'Resolución 1409 de 2012 + RETIE'
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM catalogo_riesgos_ges WHERE tipo_riesgo = 'Eléctrico'
)
UNION ALL
SELECT
  'Mantenimiento de subestaciones',
  'Riesgo eléctrico en mantenimiento preventivo y correctivo de subestaciones eléctricas. Incluye exposición a alta tensión, maniobras con equipos energizados, y operación de seccionadores.',
  'Eléctrico',
  false,
  jsonb_build_object(
    'examenes_medicos', jsonb_build_array('Electrocardiograma', 'Audiometría', 'Optometría'),
    'controles_prioritarios', jsonb_build_array('Procedimientos de conmutación', 'Bloqueo de equipos', 'Pértigas aislantes', 'Medición de voltaje'),
    'nivel_tension', 'Alta Tensión (>57.5 kV)',
    'norma_aplicable', 'NTC 2050 - Código Eléctrico Colombiano'
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM catalogo_riesgos_ges WHERE tipo_riesgo = 'Eléctrico'
);

-- ========================================
-- PASO 4: VERIFICAR INSERCIÓN
-- ========================================

SELECT
  'VERIFICACIÓN POST-INSERCIÓN' as seccion;

SELECT
  COUNT(*) as total_ges_electricos,
  COUNT(CASE WHEN es_comun = true THEN 1 END) as comunes,
  COUNT(CASE WHEN es_comun = false THEN 1 END) as no_comunes
FROM catalogo_riesgos_ges
WHERE tipo_riesgo = 'Eléctrico';

-- Mostrar GES eléctricos insertados
SELECT
  id,
  nombre,
  es_comun,
  created_at
FROM catalogo_riesgos_ges
WHERE tipo_riesgo = 'Eléctrico'
ORDER BY es_comun DESC, id ASC;

-- ========================================
-- PASO 5: REPORTE FINAL
-- ========================================

SELECT
  'RESUMEN FINAL DE CATÁLOGO' as seccion;

SELECT
  COUNT(DISTINCT tipo_riesgo) as total_categorias,
  COUNT(*) as total_ges,
  COUNT(CASE WHEN es_comun = true THEN 1 END) as ges_comunes,
  COUNT(CASE WHEN es_comun = false THEN 1 END) as ges_no_comunes
FROM catalogo_riesgos_ges;

-- Listar todas las categorías disponibles
SELECT DISTINCT tipo_riesgo as categorias_disponibles
FROM catalogo_riesgos_ges
ORDER BY tipo_riesgo;

-- ==================================================
-- FIN DEL SCRIPT
-- ==================================================

-- NOTAS DE USO:
-- 1. Ejecutar este script SOLO si /api/catalogo/validate-categories detecta falta de "Eléctrico"
-- 2. El script usa INSERT...SELECT...WHERE NOT EXISTS para evitar duplicados
-- 3. Si la categoría ya existe, las inserciones se ignoran (safe)
-- 4. Los GES incluyen metadata completa con exámenes médicos y controles
-- 5. Después de ejecutar, invalidar cache: POST /api/catalogo/cache/invalidate
