-- Script SQL para agregar GES críticos obligatorios faltantes
-- Fecha: 10 de noviembre de 2025
-- Basado en: Auditoría de Compliance SST
--
-- IMPORTANTE: Este script debe ejecutarse DESPUÉS de limpiar duplicados
-- (ver AUDITORIA_CATALOGO_GES_SST.md sección 4)

-- ============================================================================
-- PASO 1: LIMPIAR DUPLICADOS (RECOMENDADO)
-- ============================================================================

-- Opción A: Desactivar GES duplicados sin código (conservadora)
-- UPDATE catalogo_ges SET activo = false WHERE codigo IS NULL;

-- Opción B: Eliminar físicamente duplicados (limpia - RECOMENDADA)
DELETE FROM catalogo_ges WHERE codigo IS NULL;

-- ============================================================================
-- PASO 2: AGREGAR GES CRÍTICOS FALTANTES
-- ============================================================================

-- Obtener IDs de categorías de riesgo
DO $$
DECLARE
  riesgo_cs_id INTEGER;
  riesgo_rbl_id INTEGER;
BEGIN
  -- Obtener ID de Condiciones de Seguridad (CS)
  SELECT id INTO riesgo_cs_id FROM catalogo_riesgos WHERE codigo = 'CS';

  -- Obtener ID de Riesgo Biológico (RBL)
  SELECT id INTO riesgo_rbl_id FROM catalogo_riesgos WHERE codigo = 'RBL';

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
    'Trabajo en alturas - Actividades a más de 1.5 metros sobre el nivel inferior',
    'Caída de personas desde altura, traumatismos múltiples, fracturas, contusiones, esguinces, politraumatismos.',
    'Caída mortal desde altura superior a 2 metros, trauma craneoencefálico severo, fractura de columna, muerte.',
    '{"EMO": 1, "ALTURAS": 1, "VESTIBU": 2, "VISUAL": 1}',
    '["Sin vértigo", "Equilibrio adecuado", "Buena coordinación motora", "Agudeza visual sin alteraciones", "Ausencia de miedo a las alturas"]',
    '["Vértigo", "Alteraciones del equilibrio", "Síndrome vertiginoso", "Epilepsia", "Cardiopatías severas", "Hipertensión no controlada", "Alteraciones visuales graves", "Miedo extremo a las alturas", "Consumo de medicamentos que afecten el equilibrio"]',
    '["Arnés de cuerpo completo", "Línea de vida", "Eslinga de posicionamiento", "Casco con barboquejo", "Calzado antideslizante", "Mosquetones certificados", "Freno de cuerda", "Punto de anclaje certificado"]',
    '["Implementar sistema de protección contra caídas (barandas, líneas de vida)", "Certificación obligatoria para coordinadores y trabajadores (Res. 1409/2012)", "Permiso de trabajo en alturas por escrito", "Inspección diaria de EPP antes de uso", "Puntos de anclaje certificados por persona competente", "Elaborar y divulgar procedimiento seguro de trabajo", "Restricción de acceso con señalización", "Andamios certificados y armados por personal competente"]',
    '["Construcción", "Mantenimiento de edificios", "Instalación de torres", "Limpieza de fachadas", "Poda de árboles", "Telecomunicaciones", "Energía eléctrica"]',
    1,
    1000,
    true
  );

  RAISE NOTICE 'GES CS-ALTURAS agregado exitosamente';

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
    'Hepatitis B - Exposición a sangre o fluidos corporales contaminados',
    'Infección por virus de hepatitis B (VHB), hepatitis aguda, ictericia, fatiga crónica, cirrosis hepática.',
    'Hepatitis B crónica, cirrosis hepática avanzada, carcinoma hepatocelular, insuficiencia hepática, muerte.',
    '{"EMO": 1, "HEPATI": 1, "PRUINM": 1, "PLAB": 2}',
    '["Sistema inmunológico competente", "Cumplimiento de esquema de vacunación", "Conocimiento de precauciones universales"]',
    '["Inmunodeficiencia severa", "Hepatopatía crónica preexistente", "Reacción alérgica grave a vacuna de hepatitis B", "Embarazo con hepatitis B activa"]',
    '["Guantes de nitrilo o látex", "Bata desechable", "Mascarilla quirúrgica o N95", "Gafas de seguridad o caretas", "Contenedores para cortopunzantes", "Jabón antiséptico", "Alcohol glicerinado"]',
    '["Vacunación obligatoria contra hepatitis B (esquema de 3 dosis)", "Verificar títulos de anticuerpos anti-HBs post-vacunación", "Implementar precauciones universales de bioseguridad", "Uso obligatorio de EPP en todo momento", "No recapsular agujas usadas", "Contenedores rígidos para cortopunzantes en cada punto de atención", "Protocolo de exposición accidental (profilaxis post-exposición)", "Lavado de manos con técnica adecuada", "Señalización de áreas de riesgo biológico"]',
    '["Salud (hospitales, clínicas, consultorios)", "Laboratorios clínicos", "Odontología", "Veterinaria", "Tatuajes y piercings", "Morgues y servicios funerarios", "Servicios de limpieza hospitalaria"]',
    1,
    1001,
    true
  );

  RAISE NOTICE 'GES RBL-HEPATITIS agregado exitosamente';

END $$;

-- ============================================================================
-- PASO 3: VERIFICACIÓN
-- ============================================================================

-- Verificar que los GES fueron creados correctamente
SELECT
  g.id,
  g.codigo,
  g.nombre,
  r.codigo AS categoria
FROM catalogo_ges g
JOIN catalogo_riesgos r ON g.riesgo_id = r.id
WHERE g.codigo IN ('CS-ALTURAS', 'RBL-HEPATITIS')
ORDER BY g.codigo;

-- Verificar conteo total de GES activos (debe ser 101 después de limpieza + 2 nuevos = 103)
SELECT
  'Total GES activos' AS metrica,
  COUNT(*) AS valor
FROM catalogo_ges
WHERE activo = true;

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================

/*
REGULACIÓN DE REFERENCIA:

1. CS-ALTURAS (Resolución 1409/2012):
   - Obligatoria certificación de coordinador de trabajo en alturas (40 horas)
   - Obligatoria certificación de trabajador autorizado (8 horas)
   - Recertificación cada 1-2 años
   - Permiso de trabajo en alturas obligatorio
   - Inspección previa de EPP antes de cada uso
   - Puntos de anclaje certificados (5000 lb o 22.2 kN por persona)

2. RBL-HEPATITIS (Resolución 412/2000):
   - Vacunación obligatoria para personal de salud expuesto
   - Esquema: 0, 1, 6 meses (3 dosis)
   - Verificación de seroconversión (anti-HBs ≥10 mIU/mL)
   - Refuerzo si títulos bajos
   - Profilaxis post-exposición en caso de accidente (inmunoglobulina + vacuna)

SECTORES CRÍTICOS:
- CS-ALTURAS: Construcción (100% trabajadores), telecomunicaciones, energía
- RBL-HEPATITIS: Salud (100% personal asistencial), laboratorios, odontología

MULTAS POR INCUMPLIMIENTO:
- Trabajo en alturas sin certificación: hasta 500 SMLMV
- Falta de vacunación contra hepatitis B: hasta 1000 SMLMV + cierre temporal

DOCUMENTACIÓN REQUERIDA:
- CS-ALTURAS: Certificados vigentes, permisos de trabajo, inspección EPP, ATS
- RBL-HEPATITIS: Carnet de vacunación, títulos de anticuerpos, protocolo bioseguridad
*/
