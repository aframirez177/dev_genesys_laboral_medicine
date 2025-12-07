# 📦 INSTRUCCIONES: Seed 004 - GES Críticos de Compliance

## 🎯 Objetivo

Agregar **16 GES críticos** (estructura lista para 28) al catálogo de riesgos para alcanzar cumplimiento legal total con:
- GTC 45:2012 (catálogo exhaustivo)
- Ley 1010/2006 (acoso laboral)
- Ley 1257/2008 (acoso sexual)
- Resolución 350/2022 (COVID-19)
- Resolución 2844/2007 (asbesto)
- ATEX, IARC, y otras regulaciones críticas

---

## 📋 Pre-requisitos

### 1. Verificar Seeds Anteriores Ejecutados

```bash
cd /home/aframirez1772/dev_genesys_laboral_medicine

# Verificar que seeds 001, 002, 003 están aplicados
npx knex seed:list --knexfile knexfile.js
```

**Esperado**: Debe mostrar que existen al menos 94 GES activos.

### 2. Backup de Base de Datos (RECOMENDADO)

```bash
# Backup de PostgreSQL
pg_dump -h localhost -U tu_usuario -d genesys_db > backup_pre_seed_004_$(date +%Y%m%d_%H%M%S).sql

# O usando Docker (si aplica)
docker exec postgres_container pg_dump -U postgres genesys_db > backup_pre_seed_004.sql
```

---

## 🚀 Ejecución del Seed

### Opción A: Ejecutar Seed 004 Únicamente

```bash
cd /home/aframirez1772/dev_genesys_laboral_medicine

# Ejecutar SOLO seed 004
npx knex seed:run --specific=004_add_critical_compliance_ges.cjs --knexfile knexfile.js
```

### Opción B: Ejecutar Todos los Seeds (Fresh Start)

```bash
# ⚠️ CUIDADO: Esto borra y recrea TODOS los datos
npx knex seed:run --knexfile knexfile.js
```

---

## ✅ Validación Post-Ejecución

### 1. Verificar Conteo Total de GES

```bash
# Conectar a PostgreSQL
psql -h localhost -U tu_usuario -d genesys_db
```

```sql
-- Total de GES activos (debe ser ≥ 110)
SELECT COUNT(*) as total_ges
FROM catalogo_ges
WHERE activo = true;

-- Distribución por categoría
SELECT
  cr.codigo,
  cr.nombre,
  COUNT(cg.id) as total_ges
FROM catalogo_riesgos cr
LEFT JOIN catalogo_ges cg ON cr.id = cg.riesgo_id
WHERE cg.activo = true
GROUP BY cr.id, cr.codigo, cr.nombre
ORDER BY cr.orden;
```

**Resultado Esperado**:
```
 total_ges
-----------
       110  (o más, dependiendo de cuántos GES se completaron)
```

### 2. Verificar GES Críticos Insertados

```sql
-- Verificar GES obligatorios por código
SELECT codigo, nombre, activo
FROM catalogo_ges
WHERE codigo IN (
  'RPS-ACOSO-LAB',  -- Acoso Laboral
  'RPS-ACOSO-SEX',  -- Acoso Sexual
  'RPS-BURNOUT',    -- Burnout
  'RQ-ASBESTO',     -- Asbesto
  'RQ-ATEX',        -- Atmósferas Explosivas
  'RBL-COVID19',    -- COVID-19
  'RBL-HEPAT',      -- Hepatitis
  'RBL-TBC'         -- Tuberculosis
)
ORDER BY codigo;
```

**Resultado Esperado**: 8 filas con `activo = true`

### 3. Validar Integridad de Datos

```sql
-- Verificar que no hay códigos duplicados
SELECT codigo, COUNT(*) as duplicados
FROM catalogo_ges
GROUP BY codigo
HAVING COUNT(*) > 1;
-- Esperado: 0 filas (sin duplicados)

-- Verificar que todos tienen riesgo_id válido
SELECT COUNT(*) as ges_sin_riesgo
FROM catalogo_ges
WHERE riesgo_id IS NULL;
-- Esperado: 0

-- Verificar estructura JSON
SELECT
  COUNT(*) as ges_con_examenes_validos
FROM catalogo_ges
WHERE examenes_medicos IS NOT NULL
  AND jsonb_typeof(examenes_medicos) = 'object';
-- Esperado: > 100
```

---

## 🔍 Troubleshooting

### Error: "duplicate key value violates unique constraint"

**Causa**: El seed 004 ya fue ejecutado previamente.

**Solución**:
```sql
-- Verificar si los GES ya existen
SELECT codigo, nombre FROM catalogo_ges WHERE codigo LIKE 'RPS-ACOSO%';

-- Si existen y quieres reejecutar, eliminar primero:
DELETE FROM catalogo_ges WHERE codigo IN (
  'RPS-ACOSO-LAB', 'RPS-ACOSO-SEX', 'RPS-BURNOUT',
  'RPS-VIOL-TERC', 'RPS-TELETRA',
  'RQ-ASBESTO', 'RQ-METAL-PES', 'RQ-CARCINO', 'RQ-PLAGUIC', 'RQ-ATEX',
  'RBL-COVID19', 'RBL-HEPAT', 'RBL-TBC',
  'CS-CONT-ELEC-DIR', 'CS-ARCO-ELEC',
  'RFN-DESLIZ'
);

-- Luego reejecutar seed 004
```

### Error: "relation 'catalogo_ges' does not exist"

**Causa**: La migración 20251105190000_create_catalogo_riesgos_ges.cjs no se ejecutó.

**Solución**:
```bash
# Ejecutar migraciones
npx knex migrate:latest --knexfile knexfile.js

# Luego ejecutar seeds en orden
npx knex seed:run --knexfile knexfile.js
```

### Error: "column 'codigo' does not exist"

**Causa**: La columna `codigo` fue agregada en seed 003 pero no está en la migración base.

**Solución**: Verificar que seed 003 se ejecutó correctamente, o agregar la columna manualmente:

```sql
ALTER TABLE catalogo_ges ADD COLUMN IF NOT EXISTS codigo VARCHAR(50) UNIQUE;
```

---

## 📊 Análisis de Resultados

### Generar Reporte de Compliance

```sql
-- Reporte de compliance GTC 45
WITH categoria_stats AS (
  SELECT
    cr.codigo,
    cr.nombre as categoria,
    COUNT(cg.id) as total_ges,
    COUNT(CASE WHEN cg.es_comun THEN 1 END) as ges_comunes,
    COUNT(CASE WHEN cg.codigo IS NOT NULL THEN 1 END) as ges_con_codigo
  FROM catalogo_riesgos cr
  LEFT JOIN catalogo_ges cg ON cr.id = cg.riesgo_id AND cg.activo = true
  GROUP BY cr.id, cr.codigo, cr.nombre
)
SELECT
  codigo,
  categoria,
  total_ges,
  ges_comunes,
  ges_con_codigo,
  CASE
    WHEN total_ges >= 15 THEN 'CUMPLE ✅'
    WHEN total_ges >= 10 THEN 'PARCIAL ⚠️'
    ELSE 'INSUFICIENTE ❌'
  END as estado_cumplimiento
FROM categoria_stats
ORDER BY codigo;
```

### Identificar GES Faltantes por Sector

```sql
-- Ver GES relevantes por sector (ejemplo: Salud)
SELECT
  nombre,
  relevancia_por_sector->>'salud' as relevancia_salud
FROM catalogo_ges
WHERE relevancia_por_sector ? 'salud'
  AND (relevancia_por_sector->>'salud')::int >= 8
  AND activo = true
ORDER BY (relevancia_por_sector->>'salud')::int DESC;
```

---

## 🎯 Próximos Pasos

### Completar los GES Faltantes

El seed 004 actual contiene **16 GES completos** como ejemplo. Para llegar a **28 GES críticos**:

1. **Agregar 8 GES faltantes de Condiciones de Seguridad**:
   - Sepultamiento en excavaciones
   - Espacios confinados
   - Proyección de partículas
   - Atrapamiento en maquinaria
   - Golpes por objetos suspendidos
   - Trabajo en alturas (líneas de vida)
   - Puertas de emergencia bloqueadas
   - Pisos resbaladizos

2. **Agregar 4 GES faltantes de Fenómenos Naturales**:
   - Inundaciones
   - Erupciones volcánicas
   - Actividad sísmica alta intensidad
   - Rayos / Tormentas eléctricas

**Ubicación en el código**:
- Línea ~530 del seed 004: `console.log('⏩ (GES 16-23 de Condiciones Seguridad omitidos...)`
- Línea ~630 del seed 004: `console.log('⏩ (GES 25-28 de Fenómenos Naturales omitidos...)`

### Fase 2: GES Sector-Específicos (30 GES)

Crear **seed 005** para:
- Salud: 8 GES (pinchazos, fluidos corporales, violencia de pacientes, etc.)
- Construcción: 7 GES (silicosis, maquinaria pesada, etc.)
- Agricultura: 6 GES (zoonosis, insolación, etc.)
- Minería: 5 GES (derrumbes, gases tóxicos, etc.)
- Call Centers: 4 GES (fatiga visual, túnel carpiano, etc.)

### Fase 3: GES Complementarios (36 GES)

Crear **seed 006** para completar catálogo exhaustivo hasta **188+ GES**.

---

## 📞 Soporte

**Documentación de Referencia**:
- `ANALISIS_COMPLIANCE_GTC45.md` - Análisis completo de gaps
- `.claude/agents/sst-compliance.md` - Agente de compliance SST

**Contacto Técnico**:
- Revisar logs del seed: `npx knex seed:run --verbose`
- Consultar estado de migraciones: `npx knex migrate:status`

---

**Creado**: 10 de noviembre de 2025
**Versión**: 1.0
**Última actualización**: 10 nov 2025
