-- ==========================================
-- FIX 3: Normalizar Saneamiento Básico
-- ==========================================
-- Descripción: Crea/normaliza categoría Saneamiento Básico y reasigna GES
-- Impacto: +1 categoría (si no existe), +2 GES
-- Ejecutar: psql -d genesys_laboral_medicine -f scripts/fix-03-normalizar-saneamiento-basico.sql

BEGIN;

\echo '============================================'
\echo 'FIX 3: Normalizando Saneamiento Básico'
\echo '============================================'
\echo ''

-- 1. VERIFICAR/CREAR CATEGORÍA
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM catalogo_riesgos WHERE codigo = 'SAN') THEN
    RAISE NOTICE '✅ Categoría SAN ya existe';
  ELSE
    INSERT INTO catalogo_riesgos (codigo, nombre, orden, activo)
    VALUES ('SAN', 'Saneamiento Básico', 11, true);

    RAISE NOTICE '✅ Categoría SAN creada';
  END IF;
END $$;

-- 2. REASIGNAR GES EXISTENTE (ID 219)
DO $$
DECLARE
  san_id INT;
  ges_actual VARCHAR;
BEGIN
  SELECT id INTO san_id FROM catalogo_riesgos WHERE codigo = 'SAN';

  -- Verificar si GES 219 existe
  SELECT nombre INTO ges_actual FROM catalogo_ges WHERE id = 219;

  IF ges_actual IS NOT NULL THEN
    RAISE NOTICE '📝 Reasignando GES 219 ("%") a Saneamiento Básico', ges_actual;

    UPDATE catalogo_ges
    SET
      riesgo_id = san_id,
      codigo = 'SAN-AGUA-POTABLE'
    WHERE id = 219;

    RAISE NOTICE '✅ GES 219 reasignado correctamente';
  ELSE
    RAISE NOTICE '⚠️  GES 219 no encontrado. Creando nuevo GES.';

    INSERT INTO catalogo_ges (
      riesgo_id,
      nombre,
      codigo,
      consecuencias,
      peor_consecuencia,
      examenes_medicos,
      activo
    ) VALUES (
      san_id,
      'Sin disponibilidad de agua potable',
      'SAN-AGUA-POTABLE',
      'Deshidratación, enfermedades gastrointestinales (diarrea, cólera), infecciones parasitarias.',
      'Epidemias de enfermedades infecciosas, deshidratación severa, muerte.',
      '{"EMO": 1, "COPR": 2}'::jsonb,
      true
    );
  END IF;
END $$;

-- 3. AGREGAR MÁS GES DE SANEAMIENTO BÁSICO
DO $$
DECLARE
  san_id INT;
BEGIN
  SELECT id INTO san_id FROM catalogo_riesgos WHERE codigo = 'SAN';

  -- Insertar GES adicionales si no existen
  INSERT INTO catalogo_ges (
    riesgo_id,
    nombre,
    codigo,
    consecuencias,
    peor_consecuencia,
    examenes_medicos,
    epp_sugeridos,
    medidas_intervencion,
    es_comun,
    orden,
    activo
  ) VALUES
    -- Manejo inadecuado de residuos
    (
      san_id,
      'Manejo inadecuado de residuos sólidos',
      'SAN-RESIDUOS',
      'Infecciones cutáneas, enfermedades transmitidas por vectores (dengue, zika, chikungunya), infecciones respiratorias.',
      'Epidemias de enfermedades infecciosas, leptospirosis, hepatitis A.',
      '{"EMO": 1, "COPR": 2, "HEP": 2}'::jsonb,
      '["Guantes industriales", "Botas de seguridad", "Mascarilla"]'::jsonb,
      '{
        "eliminacion": "Implementar sistema de recolección externa",
        "sustitucion": "Usar contenedores herméticos",
        "controlesIngenieria": "Puntos de acopio con tapas, lavado diario",
        "controlesAdministrativos": "Protocolo de segregación de residuos, recolección diaria"
      }'::jsonb,
      false,
      2,
      true
    ),

    -- Servicios sanitarios inadecuados
    (
      san_id,
      'Falta de servicios sanitarios adecuados',
      'SAN-SANITARIOS',
      'Infecciones urinarias recurrentes, enfermedades gastrointestinales (E. coli, salmonella), parasitosis.',
      'Epidemias de enfermedades infecciosas, sepsis urinaria, deshidratación.',
      '{"EMO": 1, "COPR": 2, "UROANALISIS": 1}'::jsonb,
      '["N/A"]'::jsonb,
      '{
        "eliminacion": "Instalar baños con sistema de alcantarillado",
        "sustitucion": "Baños portátiles con mantenimiento diario (temporal)",
        "controlesIngenieria": "Baños con agua potable, jabón, papel higiénico",
        "controlesAdministrativos": "Limpieza 2 veces al día, inspección semanal"
      }'::jsonb,
      false,
      3,
      true
    )
  ON CONFLICT (codigo) DO NOTHING;

  RAISE NOTICE '✅ GES adicionales de Saneamiento Básico insertados';
END $$;

-- 4. VERIFICAR RESULTADO
\echo ''
\echo '============================================'
\echo 'VERIFICACIÓN POST-FIX:'
\echo '============================================'
\echo ''

SELECT
  r.codigo,
  r.nombre as categoria,
  COUNT(g.id) as total_ges
FROM catalogo_riesgos r
LEFT JOIN catalogo_ges g ON g.riesgo_id = r.id AND g.activo = true
WHERE r.codigo = 'SAN'
GROUP BY r.id, r.codigo, r.nombre;

\echo ''
\echo 'GES de Saneamiento Básico:'
SELECT codigo, nombre FROM catalogo_ges WHERE codigo LIKE 'SAN-%' ORDER BY orden;

COMMIT;

\echo ''
\echo '✅ Fix completado. Saneamiento Básico normalizado.'
