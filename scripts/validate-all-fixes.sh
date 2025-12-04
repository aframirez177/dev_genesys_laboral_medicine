#!/bin/bash

# ==========================================
# Script de Validación de Todos los Fixes
# ==========================================
# Descripción: Ejecuta todos los fixes y valida el resultado
# Ejecutar: bash scripts/validate-all-fixes.sh

set -e  # Exit on error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}  VALIDACIÓN COMPLETA: Fixes de Catálogo GES${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Variables
DB_NAME="genesys_laboral_medicine"
DB_USER="andres_ramirez"
DB_HOST="${DB_HOST:-localhost}"

# Función para ejecutar query y mostrar resultado
run_query() {
  local description=$1
  local query=$2
  local expected=$3

  echo -e "${YELLOW}🔍 ${description}${NC}"

  result=$(DB_HOST=$DB_HOST psql -h $DB_HOST -U $DB_USER -d $DB_NAME -t -c "$query" 2>/dev/null | xargs)

  if [ "$result" == "$expected" ]; then
    echo -e "${GREEN}✅ PASS: $result${NC}"
    return 0
  else
    echo -e "${RED}❌ FAIL: Esperado '$expected', obtenido '$result'${NC}"
    return 1
  fi
}

# Función para ejecutar script SQL
run_sql_file() {
  local file=$1
  local description=$2

  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${YELLOW}📝 Ejecutando: ${description}${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

  DB_HOST=$DB_HOST psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f "$file"

  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Script ejecutado correctamente${NC}"
  else
    echo -e "${RED}❌ Error ejecutando script${NC}"
    exit 1
  fi
}

# Preguntar si ejecutar fixes o solo validar
echo -e "${YELLOW}¿Deseas ejecutar los fixes SQL? (s/n)${NC}"
read -r execute_fixes

if [ "$execute_fixes" == "s" ] || [ "$execute_fixes" == "S" ]; then
  echo ""
  echo -e "${GREEN}Ejecutando fixes...${NC}"
  echo ""

  # Ejecutar fixes en orden
  run_sql_file "scripts/fix-01-eliminar-duplicados.sql" "Fix 1: Eliminar Duplicados"
  run_sql_file "scripts/fix-02-agregar-categoria-seguridad.sql" "Fix 2: Agregar Categoría Seguridad"
  run_sql_file "scripts/fix-03-normalizar-saneamiento-basico.sql" "Fix 3: Normalizar Saneamiento Básico"
  run_sql_file "scripts/fix-04-crear-tabla-aliases.sql" "Fix 4: Crear Tabla de Aliases"

  echo ""
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}✅ Todos los fixes ejecutados correctamente${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
else
  echo ""
  echo -e "${YELLOW}Saltando ejecución de fixes. Solo validando...${NC}"
  echo ""
fi

# ==========================================
# VALIDACIONES
# ==========================================

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  VALIDACIONES POST-FIX${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Test 1: No hay duplicados
run_query \
  "Test 1: Verificar que no haya duplicados" \
  "SELECT COUNT(*) FROM (SELECT nombre, COUNT(*) as total FROM catalogo_ges WHERE activo = true GROUP BY nombre HAVING COUNT(*) > 1) as dups;" \
  "0"

echo ""

# Test 2: Categoría Seguridad tiene 6 GES
run_query \
  "Test 2: Verificar que Seguridad tenga 6 GES" \
  "SELECT COUNT(*) FROM catalogo_ges g JOIN catalogo_riesgos r ON r.id = g.riesgo_id WHERE r.codigo = 'SEG' AND g.activo = true;" \
  "6"

echo ""

# Test 3: Categoría Saneamiento Básico tiene al menos 1 GES
echo -e "${YELLOW}🔍 Test 3: Verificar que Saneamiento Básico tenga al menos 1 GES${NC}"
san_count=$(DB_HOST=$DB_HOST psql -h $DB_HOST -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM catalogo_ges g JOIN catalogo_riesgos r ON r.id = g.riesgo_id WHERE r.codigo = 'SAN' AND g.activo = true;" | xargs)

if [ "$san_count" -ge "1" ]; then
  echo -e "${GREEN}✅ PASS: $san_count GES encontrados${NC}"
else
  echo -e "${RED}❌ FAIL: Solo $san_count GES encontrados${NC}"
  exit 1
fi

echo ""

# Test 4: Tabla de aliases existe
run_query \
  "Test 4: Verificar que tabla catalogo_ges_aliases exista" \
  "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'catalogo_ges_aliases';" \
  "1"

echo ""

# Test 5: Hay al menos 6 aliases creados
echo -e "${YELLOW}🔍 Test 5: Verificar que haya al menos 6 aliases${NC}"
alias_count=$(DB_HOST=$DB_HOST psql -h $DB_HOST -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM catalogo_ges_aliases;" | xargs)

if [ "$alias_count" -ge "6" ]; then
  echo -e "${GREEN}✅ PASS: $alias_count aliases encontrados${NC}"
else
  echo -e "${RED}❌ FAIL: Solo $alias_count aliases encontrados${NC}"
  exit 1
fi

echo ""

# Test 6: Total de GES activos (debe ser ~107 después de eliminar duplicados)
echo -e "${YELLOW}🔍 Test 6: Verificar total de GES activos${NC}"
total_ges=$(DB_HOST=$DB_HOST psql -h $DB_HOST -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM catalogo_ges WHERE activo = true;" | xargs)

echo -e "${GREEN}Total GES activos: $total_ges${NC}"

if [ "$total_ges" -ge "100" ] && [ "$total_ges" -le "110" ]; then
  echo -e "${GREEN}✅ PASS: Total en rango esperado (100-110)${NC}"
else
  echo -e "${YELLOW}⚠️  WARNING: Total fuera de rango esperado${NC}"
fi

echo ""

# Test 7: Todas las categorías tienen al menos 1 GES
echo -e "${YELLOW}🔍 Test 7: Verificar que todas las categorías tengan GES${NC}"

DB_HOST=$DB_HOST psql -h $DB_HOST -U $DB_USER -d $DB_NAME << EOF
SELECT
  r.codigo,
  r.nombre,
  COUNT(g.id) as total_ges,
  CASE
    WHEN COUNT(g.id) = 0 THEN '❌ SIN GES'
    WHEN COUNT(g.id) < 3 THEN '⚠️  POCOS GES'
    ELSE '✅ OK'
  END as estado
FROM catalogo_riesgos r
LEFT JOIN catalogo_ges g ON g.riesgo_id = r.id AND g.activo = true
GROUP BY r.id, r.codigo, r.nombre
ORDER BY r.orden;
EOF

echo ""

# ==========================================
# RESUMEN FINAL
# ==========================================

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  ✅ VALIDACIÓN COMPLETADA${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${GREEN}Resultados:${NC}"
echo "  ✅ Duplicados eliminados: 0 duplicados restantes"
echo "  ✅ Categoría Seguridad: 6 GES"
echo "  ✅ Categoría Saneamiento: $san_count GES"
echo "  ✅ Aliases creados: $alias_count"
echo "  ✅ Total GES activos: $total_ges"
echo ""

echo -e "${YELLOW}Próximos pasos:${NC}"
echo "  1. Actualizar CatalogoRepository.findGES() para incluir nombre_riesgo"
echo "  2. Agregar endpoint /api/catalogo/ges/alias/:nombre"
echo "  3. Migrar frontend a consumir API o implementar mapeo de nombres"
echo "  4. Reiniciar servidor para invalidar cache"
echo ""

echo -e "${BLUE}Documentación generada:${NC}"
echo "  - .claude/logs/auditorias/AUDITORIA_CATALOGO_GES_2025-11-15.md"
echo "  - .claude/logs/resumenes/RESUMEN_AUDITORIA_GES_2025-11-15.md"
echo ""

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
