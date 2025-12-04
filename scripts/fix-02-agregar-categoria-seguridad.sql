-- ==========================================
-- FIX 2: Agregar Categoría SEGURIDAD
-- ==========================================
-- Descripción: Crea categoría Seguridad y agrega 6 GES críticos
-- Impacto: +1 categoría, +6 GES
-- Ejecutar: psql -d genesys_laboral_medicine -f scripts/fix-02-agregar-categoria-seguridad.sql

BEGIN;

\echo '============================================'
\echo 'FIX 2: Agregando Categoría SEGURIDAD'
\echo '============================================'
\echo ''

-- 1. VERIFICAR SI CATEGORÍA YA EXISTE
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM catalogo_riesgos WHERE codigo = 'SEG') THEN
    RAISE NOTICE '⚠️  Categoría SEG ya existe. Omitiendo creación.';
  ELSE
    -- Crear categoría
    INSERT INTO catalogo_riesgos (codigo, nombre, orden, activo)
    VALUES ('SEG', 'Seguridad', 10, true);

    RAISE NOTICE '✅ Categoría SEG creada correctamente';
  END IF;
END $$;

-- 2. INSERTAR GES DE SEGURIDAD
DO $$
DECLARE
  seguridad_id INT;
  ges_count INT;
BEGIN
  -- Obtener ID de categoría Seguridad
  SELECT id INTO seguridad_id FROM catalogo_riesgos WHERE codigo = 'SEG';

  IF seguridad_id IS NULL THEN
    RAISE EXCEPTION 'Error: No se pudo obtener ID de categoría Seguridad';
  END IF;

  -- Verificar si ya existen GES para Seguridad
  SELECT COUNT(*) INTO ges_count
  FROM catalogo_ges
  WHERE riesgo_id = seguridad_id;

  IF ges_count > 0 THEN
    RAISE NOTICE '⚠️  Ya existen % GES para Seguridad. Omitiendo inserción.', ges_count;
  ELSE
    -- Insertar 6 GES de Seguridad
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
      -- 1. Secuestros
      (
        seguridad_id,
        'Secuestros',
        'SEG-SECUESTRO',
        'Trauma psicológico agudo, síndrome de estrés postraumático (TEPT), ansiedad severa, depresión, lesiones físicas por cautiverio prolongado.',
        'Muerte del trabajador o terceros, trauma psicológico irreversible, discapacidad mental permanente.',
        '{"EMO": 1, "PSICO": 1}'::jsonb,
        '["GPS de emergencia", "Capacitación en protocolo de seguridad"]'::jsonb,
        '{
          "eliminacion": "Evitar desplazamientos a zonas de alto riesgo",
          "sustitucion": "Utilizar transporte seguro con escoltas en zonas críticas",
          "controlesIngenieria": "Sistema de rastreo GPS, botones de pánico",
          "controlesAdministrativos": "Protocolo de comunicación cada 2 horas, rutas seguras validadas"
        }'::jsonb,
        false,
        1,
        true
      ),

      -- 2. Amenazas
      (
        seguridad_id,
        'Amenazas',
        'SEG-AMENAZAS',
        'Estrés crónico, ansiedad, insomnio, miedo constante, síndrome de burnout, trastornos adaptativos.',
        'Agresión física, daño psicológico severo, riesgo de vida.',
        '{"EMO": 1, "PSICO": 1}'::jsonb,
        '["Capacitación en manejo de conflictos", "Línea de atención 24/7"]'::jsonb,
        '{
          "eliminacion": "Implementar teletrabajo en casos críticos",
          "sustitucion": "Rotación de personal expuesto",
          "controlesIngenieria": "Sistemas de alarma, cámaras de seguridad",
          "controlesAdministrativos": "Denuncias ante autoridades, escoltas de seguridad"
        }'::jsonb,
        false,
        2,
        true
      ),

      -- 3. Hurtos - Robos - Atracos
      (
        seguridad_id,
        'Hurtos - Robos - Atracos',
        'SEG-HURTO',
        'Trauma psicológico, síndrome de estrés postraumático, lesiones físicas por agresión (golpes, arma blanca/fuego), pérdidas materiales.',
        'Muerte del trabajador, lesiones graves permanentes, discapacidad física o mental.',
        '{"EMO": 1, "PSICO": 1, "RX_TORAX": 2}'::jsonb,
        '["Alarma personal", "Capacitación en prevención de hurtos"]'::jsonb,
        '{
          "eliminacion": "Evitar portar valores o dinero en efectivo",
          "sustitucion": "Uso de transporte seguro empresarial",
          "controlesIngenieria": "Cámaras de vigilancia, escoltas, vehículos blindados",
          "controlesAdministrativos": "Rutas seguras validadas, horarios de menor riesgo"
        }'::jsonb,
        true,
        3,
        true
      ),

      -- 4. Accidente de Tránsito
      (
        seguridad_id,
        'Accidente de Tránsito',
        'SEG-TRANSITO',
        'Lesiones leves a graves (fracturas, politraumatismos, trauma craneoencefálico), discapacidad temporal o permanente, pérdida de extremidades.',
        'Muerte del trabajador o terceros, paraplejia, tetraplejia, trauma craneoencefálico severo.',
        '{"EMO": 1, "OPTO": 1, "AUD": 2, "RX_COLUMNA": 2}'::jsonb,
        '["Cinturón de seguridad", "Casco (motociclistas)", "Chaleco reflectivo"]'::jsonb,
        '{
          "eliminacion": "Teletrabajo para reducir desplazamientos",
          "sustitucion": "Uso de transporte público seguro o empresarial",
          "controlesIngenieria": "Vehículos con sistemas de seguridad activa (ABS, airbags)",
          "controlesAdministrativos": "Capacitación en manejo defensivo, pausas activas en viajes largos"
        }'::jsonb,
        true,
        4,
        true
      ),

      -- 5. Desorden público - Atentados
      (
        seguridad_id,
        'Desorden público - Atentados',
        'SEG-DESORDEN',
        'Trauma psicológico, lesiones por explosión (quemaduras, amputaciones, pérdida auditiva), inhalación de humo o gases tóxicos.',
        'Muerte por explosión, quemaduras de 3er grado, pérdida de extremidades, ceguera.',
        '{"EMO": 1, "PSICO": 1, "AUD": 2, "OPTO": 2, "RX_TORAX": 2}'::jsonb,
        '["Plan de evacuación", "Capacitación en primeros auxilios"]'::jsonb,
        '{
          "eliminacion": "Suspender actividades en zonas de conflicto",
          "sustitucion": "Teletrabajo en situaciones de riesgo inminente",
          "controlesIngenieria": "Rutas de evacuación señalizadas, puntos de encuentro",
          "controlesAdministrativos": "Monitoreo de situación de orden público, protocolos de emergencia"
        }'::jsonb,
        false,
        5,
        true
      ),

      -- 6. Extorsión
      (
        seguridad_id,
        'Extorsión',
        'SEG-EXTORSION',
        'Estrés crónico severo, ansiedad generalizada, depresión, insomnio, pérdida de peso, somatización (úlceras, hipertensión).',
        'Daño psicológico severo irreversible, suicidio, pérdidas económicas catastróficas.',
        '{"EMO": 1, "PSICO": 1}'::jsonb,
        '["Línea directa con autoridades", "Seguro contra extorsión"]'::jsonb,
        '{
          "eliminacion": "Evitar publicidad de éxitos o bienes materiales",
          "sustitucion": "Rotación de personal expuesto",
          "controlesIngenieria": "Sistemas de comunicación segura cifrada",
          "controlesAdministrativos": "Denuncia inmediata ante autoridades, asesoría legal especializada"
        }'::jsonb,
        false,
        6,
        true
      );

    RAISE NOTICE '✅ 6 GES de Seguridad insertados correctamente';
  END IF;
END $$;

-- 3. VERIFICAR RESULTADO
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
WHERE r.codigo = 'SEG'
GROUP BY r.id, r.codigo, r.nombre;

\echo ''
\echo 'GES de Seguridad creados:'
SELECT codigo, nombre FROM catalogo_ges WHERE codigo LIKE 'SEG-%' ORDER BY orden;

COMMIT;

\echo ''
\echo '✅ Fix completado. Categoría Seguridad agregada.'
