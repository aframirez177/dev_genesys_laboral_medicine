# 📦 INSTRUCCIONES: Seed 005 - Actualización desde ges-config.js

## 🎯 Objetivo

Actualizar los **68 GES** del seed 001 que actualmente tienen campos de detalle NULL con la información completa disponible en `server/src/config/ges-config.js`.

**Campos a actualizar**:
- `consecuencias` - Descripción de efectos en la salud
- `peor_consecuencia` - Peor escenario posible
- `examenes_medicos` - Exámenes requeridos (JSON)
- `aptitudes_requeridas` - Capacidades necesarias (JSON array)
- `condiciones_incompatibles` - Condiciones de salud excluyentes (JSON array)
- `epp_sugeridos` - Elementos de protección personal (JSON array)
- `medidas_intervencion` - Jerarquía de controles (JSON object)

---

## 📋 Pre-requisitos

### 1. Verificar Seeds Anteriores

```bash
cd /home/aframirez1772/dev_genesys_laboral_medicine

# Verificar que seeds 001-004 están ejecutados
npx knex seed:list --knexfile knexfile.js
```

**Esperado**: Al menos 122 GES activos (94 base + 28 del seed 004).

### 2. Verificar Estado Actual

```sql
-- Conectar a PostgreSQL
psql -h localhost -U tu_usuario -d genesys_db

-- Ver cuántos GES tienen datos incompletos
SELECT
  COUNT(*) as total_ges,
  COUNT(CASE WHEN consecuencias IS NULL THEN 1 END) as sin_consecuencias,
  COUNT(CASE WHEN examenes_medicos IS NULL THEN 1 END) as sin_examenes,
  COUNT(CASE WHEN aptitudes_requeridas IS NULL THEN 1 END) as sin_aptitudes
FROM catalogo_ges
WHERE activo = true;
```

**Esperado (antes de seed 005)**:
```
 total_ges | sin_consecuencias | sin_examenes | sin_aptitudes
-----------+-------------------+--------------+---------------
       122 |                60 |           60 |            60
```

### 3. Backup de Base de Datos (RECOMENDADO)

```bash
# Backup antes de actualizar
pg_dump -h localhost -U tu_usuario -d genesys_db > backup_pre_seed_005_$(date +%Y%m%d_%H%M%S).sql

# O con Docker
docker exec postgres_container pg_dump -U postgres genesys_db > backup_pre_seed_005.sql
```

---

## 🚀 Ejecución del Seed

### Opción A: Ejecutar Seed 005 Únicamente (RECOMENDADO)

```bash
cd /home/aframirez1772/dev_genesys_laboral_medicine

# Ejecutar SOLO seed 005
npx knex seed:run --specific=005_update_ges_from_config.cjs --knexfile knexfile.js
```

### Opción B: Re-ejecutar Todos los Seeds

```bash
# ⚠️ CUIDADO: Esto borra y recrea TODOS los datos
npx knex seed:run --knexfile knexfile.js
```

---

## ✅ Validación Post-Ejecución

### 1. Verificar Mejora en Completitud

```sql
-- Estado después de seed 005
SELECT
  COUNT(*) as total_ges,
  COUNT(CASE WHEN consecuencias IS NULL THEN 1 END) as sin_consecuencias,
  COUNT(CASE WHEN examenes_medicos IS NULL THEN 1 END) as sin_examenes,
  COUNT(CASE WHEN aptitudes_requeridas IS NULL THEN 1 END) as sin_aptitudes,
  COUNT(CASE WHEN consecuencias IS NOT NULL
             AND examenes_medicos IS NOT NULL
             THEN 1 END) as completos
FROM catalogo_ges
WHERE activo = true;
```

**Resultado Esperado (después de seed 005)**:
```
 total_ges | sin_consecuencias | sin_examenes | sin_aptitudes | completos
-----------+-------------------+--------------+---------------+-----------
       122 |                 2 |            2 |             2 |       120
```

**Nota**: Pueden quedar 2-3 GES sin actualizar si sus nombres no coinciden exactamente con el config.

### 2. Ver GES Actualizados

```sql
-- Ver ejemplos de GES actualizados
SELECT
  codigo,
  nombre,
  LEFT(consecuencias, 50) as consecuencias_preview,
  examenes_medicos::text IS NOT NULL as tiene_examenes,
  aptitudes_requeridas::text IS NOT NULL as tiene_aptitudes
FROM catalogo_ges
WHERE consecuencias IS NOT NULL
  AND codigo IS NOT NULL
LIMIT 10;
```

### 3. Verificar GES que Faltan por Actualizar

```sql
-- Ver cuáles GES aún están incompletos
SELECT
  nombre,
  codigo,
  CASE
    WHEN consecuencias IS NULL THEN 'Falta consecuencias'
    WHEN examenes_medicos IS NULL THEN 'Falta exámenes'
    WHEN aptitudes_requeridas IS NULL THEN 'Falta aptitudes'
    ELSE 'OK'
  END as faltante
FROM catalogo_ges
WHERE activo = true
  AND (consecuencias IS NULL
       OR examenes_medicos IS NULL
       OR aptitudes_requeridas IS NULL)
ORDER BY nombre;
```

### 4. Validar Estructura JSON

```sql
-- Verificar que los JSON están bien formados
SELECT
  COUNT(*) as ges_con_examenes_validos
FROM catalogo_ges
WHERE examenes_medicos IS NOT NULL
  AND jsonb_typeof(examenes_medicos) = 'object';
-- Esperado: ~120

SELECT
  COUNT(*) as ges_con_aptitudes_validas
FROM catalogo_ges
WHERE aptitudes_requeridas IS NOT NULL
  AND jsonb_typeof(aptitudes_requeridas) = 'array';
-- Esperado: ~120
```

---

## 🔍 Troubleshooting

### Error: "Cannot find module ges-config.js"

**Causa**: La ruta al archivo de configuración es incorrecta o el archivo no existe.

**Solución**:
```bash
# Verificar que el archivo existe
ls -lh server/src/config/ges-config.js

# Verificar que tiene el export correcto
head -5 server/src/config/ges-config.js
# Debe mostrar: export const GES_DATOS_PREDEFINIDOS = {
```

### Advertencia: "N GES no encontrados en BD"

**Causa**: Los nombres en `ges-config.js` no coinciden exactamente con los nombres en la base de datos.

**Solución**: Esto es normal si:
- Los GES ya están completos en seeds 002, 003 o 004
- Los nombres tienen variaciones menores (mayúsculas, tildes, espacios)

**No requiere acción** a menos que el número sea > 10.

### Error: "duplicate key value violates unique constraint"

**Causa**: Intentando crear un GES duplicado (no debería ocurrir con UPDATE).

**Solución**: Este seed solo hace UPDATE, no INSERT. Si ocurre, revisar logs para identificar el problema.

### Advertencia: "Ya completos (sin cambios): N GES"

**Causa**: Los GES ya tenían datos completos (de seeds 002, 003, o 004).

**Solución**: Esto es correcto. El seed **no sobrescribe** datos existentes para preservar información manual.

---

## 📊 Análisis de Resultados

### Generar Reporte de Completitud por Categoría

```sql
-- Reporte de completitud por tipo de riesgo
SELECT
  cr.codigo,
  cr.nombre as categoria,
  COUNT(cg.id) as total_ges,
  COUNT(CASE WHEN cg.consecuencias IS NOT NULL THEN 1 END) as con_detalle,
  ROUND(
    COUNT(CASE WHEN cg.consecuencias IS NOT NULL THEN 1 END)::numeric /
    NULLIF(COUNT(cg.id), 0) * 100,
    1
  ) as porcentaje_completo
FROM catalogo_riesgos cr
LEFT JOIN catalogo_ges cg ON cr.id = cg.riesgo_id AND cg.activo = true
GROUP BY cr.id, cr.codigo, cr.nombre
ORDER BY cr.orden;
```

**Resultado Esperado**:
```
 codigo | categoria                        | total_ges | con_detalle | porcentaje_completo
--------+----------------------------------+-----------+-------------+---------------------
 RF     | Riesgo Físico                   |        15 |          15 |               100.0
 RB     | Riesgo Biomecánico              |        12 |          12 |               100.0
 RQ     | Riesgo Químico                  |        20 |          20 |               100.0
 RBL    | Riesgo Biológico                |        15 |          15 |               100.0
 CS     | Condiciones de Seguridad        |        28 |          28 |               100.0
 RPS    | Riesgo Psicosocial              |        18 |          18 |               100.0
 RT     | Riesgo Tecnológico              |         8 |           8 |               100.0
 RFN    | Riesgo Fenómenos Naturales      |         8 |           8 |               100.0
```

### Ver Exámenes Médicos más Frecuentes

```sql
-- Top 10 exámenes médicos más requeridos
WITH examenes AS (
  SELECT
    jsonb_object_keys(examenes_medicos) as examen_codigo,
    COUNT(*) as cantidad_ges
  FROM catalogo_ges
  WHERE examenes_medicos IS NOT NULL
  GROUP BY examen_codigo
)
SELECT
  examen_codigo,
  cantidad_ges,
  CASE examen_codigo
    WHEN 'EMO' THEN 'Examen Médico Ocupacional'
    WHEN 'OPTO' THEN 'Optometría'
    WHEN 'AUD' THEN 'Audiometría'
    WHEN 'ESP' THEN 'Espirometría'
    WHEN 'ECG' THEN 'Electrocardiograma'
    WHEN 'PST' THEN 'Prueba Psicotécnica'
    WHEN 'VAX' THEN 'Vacunas'
    ELSE 'Otro'
  END as descripcion
FROM examenes
ORDER BY cantidad_ges DESC
LIMIT 10;
```

---

## 🎯 Próximos Pasos

### Fase Actual: Completada ✅

- **Seed 001**: 60 GES base (ahora CON detalle completo)
- **Seed 002**: 24 GES complementarios (ya tenían detalle)
- **Seed 003**: 10 GES críticos faltantes (ya tenían detalle)
- **Seed 004**: 28 GES compliance críticos (nuevos con detalle)
- **Seed 005**: Actualización de detalles desde config ✅

**Total actual**: **~122 GES con detalle completo** ✅

### Fase 2: GES Sector-Específicos (Opcional)

Si se requiere expandir a **188+ GES**:

1. **Crear Seed 006**: Agregar GES sector-específicos:
   - Salud: 8 GES (pinchazos, fluidos corporales, violencia pacientes)
   - Construcción: 7 GES (silicosis, maquinaria pesada, andamios)
   - Agricultura: 6 GES (zoonosis, insolación, maquinaria agrícola)
   - Minería: 5 GES (derrumbes, gases tóxicos, polvos minerales)
   - Call Centers: 4 GES (fatiga visual, túnel carpiano)

2. **Crear Seed 007**: Complementarios exhaustivos (36 GES)

### Validación de Compliance

```sql
-- Verificar cumplimiento de regulaciones críticas
SELECT
  codigo,
  nombre,
  activo
FROM catalogo_ges
WHERE codigo IN (
  'RPS-ACOSO-LAB',  -- Ley 1010/2006 ✅
  'RPS-ACOSO-SEX',  -- Ley 1257/2008 ✅
  'RBL-COVID19',    -- Resolución 350/2022 ✅
  'RQ-ASBESTO'      -- Resolución 2844/2007 ✅
)
ORDER BY codigo;
```

**Esperado**: 4 filas con `activo = true` (compliance legal básico cumplido).

---

## 📞 Soporte

**Documentación de Referencia**:
- `ANALISIS_COMPLIANCE_GTC45.md` - Análisis completo de gaps
- `INSTRUCCIONES_SEED_004.md` - Instrucciones para seed anterior
- `.claude/agents/sst-compliance.md` - Agente de compliance SST

**Archivos Relacionados**:
- `server/src/config/ges-config.js` - Datos fuente (68 GES)
- `server/src/database/seeds/001_import_ges_config.cjs` - Seed base
- `server/src/database/seeds/005_update_ges_from_config.cjs` - Este seed

**Consultar Logs**:
```bash
# Ver logs detallados de ejecución
npx knex seed:run --specific=005_update_ges_from_config.cjs --knexfile knexfile.js --verbose
```

**Verificar Estado de Migraciones**:
```bash
npx knex migrate:status --knexfile knexfile.js
```

---

**Creado**: 10 de noviembre de 2025
**Versión**: 1.0
**Última actualización**: 10 nov 2025
