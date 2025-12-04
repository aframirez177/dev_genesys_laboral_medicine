-- Script SQL corregido para agregar GES críticos obligatorios
-- Fecha: 10 de noviembre de 2025

-- Obtener IDs de categorías de riesgo
DO $$
DECLARE
  riesgo_cs_id INTEGER;
  riesgo_rbl_id INTEGER;
  max_orden_cs INTEGER;
  max_orden_rbl INTEGER;
BEGIN
  -- Obtener ID de Condiciones de Seguridad (CS)
  SELECT id INTO riesgo_cs_id FROM catalogo_riesgos WHERE codigo = 'CS';

  -- Obtener ID de Riesgo Biológico (RBL)
  SELECT id INTO riesgo_rbl_id FROM catalogo_riesgos WHERE codigo = 'RBL';

  -- Obtener orden máximo actual
  SELECT COALESCE(MAX(orden), 0) INTO max_orden_cs FROM catalogo_ges WHERE riesgo_id = riesgo_cs_id;
  SELECT COALESCE(MAX(orden), 0) INTO max_orden_rbl FROM catalogo_ges WHERE riesgo_id = riesgo_rbl_id;

  -- ============================================================================
  -- GES 1: TRABAJO EN ALTURAS (CS-ALTURAS)
  -- Regulación: Resolución 1409/2012
  -- ============================================================================

  INSERT INTO catalogo_ges (
    riesgo_id,
    codigo,
    nombre,
    consecuencias,
    peor_consecuencia,
    examenes_medicos,
    aptitudes_requeridas,
    condiciones_incompatibles,
    epp_sugeridos,
    medidas_intervencion,
    relevancia_por_sector,
    es_comun,
    orden,
    activo
  ) VALUES (
    riesgo_cs_id,
    'CS-ALTURAS',
    'Trabajo en alturas - Actividades a más de 1.5 metros',
    'Caída de personas desde altura, traumatismos múltiples, fracturas, contusiones, esguinces.',
    'Caída mortal desde altura, trauma craneoencefálico severo, fractura de columna, muerte.',
    '{"EMO": 1, "ALTURAS": 1, "VESTIBU": 2, "VISUAL": 1}'::jsonb,
    '["Sin vértigo", "Equilibrio adecuado", "Buena coordinación motora", "Agudeza visual sin alteraciones", "Ausencia de miedo a las alturas"]'::jsonb,
    '["Vértigo", "Alteraciones del equilibrio", "Síndrome vertiginoso", "Epilepsia", "Cardiopatías severas", "Hipertensión no controlada"]'::jsonb,
    '["Arnés de cuerpo completo", "Línea de vida", "Eslinga de posicionamiento", "Casco con barboquejo", "Calzado antideslizante", "Mosquetones certificados"]'::jsonb,
    '{"eliminacion": "Trabajar a nivel del suelo siempre que sea posible, evitar actividades en altura.", "sustitucion": "Uso de plataformas elevadoras mecánicas en lugar de escaleras o andamios.", "controles_ingenieria": "Instalación de barandas perimetrales permanentes, redes de seguridad, líneas de vida horizontales certificadas, puntos de anclaje estructurales.", "controles_administrativos": "Certificación obligatoria Res. 1409/2012 (coordinador 40h, trabajador 8h). Permiso de trabajo en alturas por escrito. Inspección diaria de EPP. Procedimientos seguros de trabajo. Restricción de acceso con señalización."}'::jsonb,
    '{"construccion": 10, "manufactura": 7, "servicios_publicos": 9, "telecomunicaciones": 10, "mineria": 8, "metalmecanica": 7, "oficina": 2}'::jsonb,
    true,
    max_orden_cs + 1,
    true
  );

  RAISE NOTICE 'GES CS-ALTURAS agregado exitosamente con orden %', max_orden_cs + 1;

  -- ============================================================================
  -- GES 2: HEPATITIS B (RBL-HEPATITIS)
  -- Regulación: Resolución 412/2000
  -- ============================================================================

  INSERT INTO catalogo_ges (
    riesgo_id,
    codigo,
    nombre,
    consecuencias,
    peor_consecuencia,
    examenes_medicos,
    aptitudes_requeridas,
    condiciones_incompatibles,
    epp_sugeridos,
    medidas_intervencion,
    relevancia_por_sector,
    es_comun,
    orden,
    activo
  ) VALUES (
    riesgo_rbl_id,
    'RBL-HEPATITIS',
    'Hepatitis B - Exposición a sangre o fluidos contaminados',
    'Infección por virus de hepatitis B (VHB), hepatitis aguda, ictericia, fatiga crónica, cirrosis hepática.',
    'Hepatitis B crónica, cirrosis hepática avanzada, carcinoma hepatocelular, insuficiencia hepática, muerte.',
    '{"EMO": 1, "HEPATI": 1, "PRUINM": 1, "PLAB": 2}'::jsonb,
    '["Sistema inmunológico competente", "Cumplimiento de esquema de vacunación", "Conocimiento de precauciones universales"]'::jsonb,
    '["Inmunodeficiencia severa", "Hepatopatía crónica preexistente", "Reacción alérgica grave a vacuna de hepatitis B"]'::jsonb,
    '["Guantes de nitrilo o látex", "Bata desechable", "Mascarilla quirúrgica o N95", "Gafas de seguridad", "Contenedores para cortopunzantes"]'::jsonb,
    '{"eliminacion": "Automatización de procedimientos que involucren manipulación de sangre o fluidos.", "sustitucion": "Uso de dispositivos con mecanismos de seguridad (agujas retráctiles, sistemas cerrados).", "controles_ingenieria": "Contenedores rígidos para cortopunzantes en cada punto de atención. Sistemas de eliminación de residuos biológicos. Lavamanos con sensor automático.", "controles_administrativos": "Vacunación obligatoria contra hepatitis B (esquema 3 dosis: 0, 1, 6 meses). Verificar títulos de anticuerpos anti-HBs ≥10 mIU/mL. Precauciones universales de bioseguridad. No recapsular agujas. Protocolo post-exposición (profilaxis). Señalización de riesgo biológico."}'::jsonb,
    '{"salud": 10, "laboratorios": 10, "odontologia": 10, "veterinaria": 9, "funeraria": 8, "limpieza_hospitalaria": 8, "oficina": 1}'::jsonb,
    true,
    max_orden_rbl + 1,
    true
  );

  RAISE NOTICE 'GES RBL-HEPATITIS agregado exitosamente con orden %', max_orden_rbl + 1;

END $$;

-- Verificar que los GES fueron creados
SELECT
  g.id,
  g.codigo,
  g.nombre,
  r.codigo AS categoria,
  g.es_comun,
  g.orden
FROM catalogo_ges g
JOIN catalogo_riesgos r ON g.riesgo_id = r.id
WHERE g.codigo IN ('CS-ALTURAS', 'RBL-HEPATITIS')
ORDER BY g.codigo;

-- Verificar conteo total
SELECT
  'Total GES activos' AS metrica,
  COUNT(*) AS valor
FROM catalogo_ges
WHERE activo = true;
