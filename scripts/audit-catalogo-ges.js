/**
 * Script de Auditoría Completa del Catálogo GES
 *
 * Objetivo: Analizar completitud, compliance legal y calidad de datos
 * del catálogo de Grados de Exposición y Severidad (GES) según GTC 45:2012
 *
 * Ejecutar: node scripts/audit-catalogo-ges.js
 */

require('dotenv').config({ path: './server/.env' });
const knexConfig = require('../knexfile.js');
const knex = require('knex')(knexConfig.development);

// Colores para terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// GES obligatorios por regulación colombiana
const GES_OBLIGATORIOS_LEGALES = [
  { codigo: 'RPS-ACOSO-LAB', ley: 'Ley 1010/2006', nombre: 'Acoso Laboral' },
  { codigo: 'RPS-ACOSO-SEX', ley: 'Ley 1257/2008', nombre: 'Acoso Sexual' },
  { codigo: 'RQ-ASBESTO', ley: 'Res. 2844/2007', nombre: 'Asbesto/Amianto' },
  { codigo: 'RBL-COVID19', ley: 'Res. 350/2022', nombre: 'COVID-19' },
  { codigo: 'CS-ALTURAS', ley: 'Res. 1409/2012', nombre: 'Trabajo en Alturas' },
  { codigo: 'CS-ESP-CONF', ley: 'Res. 491/2020', nombre: 'Espacios Confinados' },
  { codigo: 'RBL-HEPATITIS', ley: 'Res. 412/2000', nombre: 'Hepatitis B' },
  { codigo: 'RPS-BURNOUT', ley: 'Res. 2646/2008', nombre: 'Burnout/Desgaste' }
];

// Categorías de riesgo GTC 45
const CATEGORIAS_RIESGO = [
  { codigo: 'RF', nombre: 'Riesgo Físico', minimo: 10 },
  { codigo: 'RB', nombre: 'Riesgo Biomecánico', minimo: 10 },
  { codigo: 'RQ', nombre: 'Riesgo Químico', minimo: 10 },
  { codigo: 'RBL', nombre: 'Riesgo Biológico', minimo: 8 },
  { codigo: 'CS', nombre: 'Condiciones de Seguridad', minimo: 20 },
  { codigo: 'RPS', nombre: 'Riesgo Psicosocial', minimo: 10 },
  { codigo: 'RT', nombre: 'Riesgo Tecnológico', minimo: 4 },
  { codigo: 'RFN', nombre: 'Fenómenos Naturales', minimo: 6 }
];

async function auditarCatalogo() {
  console.log(`${colors.cyan}╔═══════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║  AUDITORÍA CATÁLOGO GES - COMPLIANCE SST COLOMBIA         ║${colors.reset}`);
  console.log(`${colors.cyan}╚═══════════════════════════════════════════════════════════╝${colors.reset}\n`);

  try {
    // 1. CONTEO TOTAL Y DISTRIBUCIÓN
    console.log(`${colors.blue}[1] INVENTARIO GENERAL${colors.reset}`);
    console.log('━'.repeat(60));

    const totalGES = await knex('catalogo_ges')
      .where('activo', true)
      .count('id as total');

    const totalActivo = parseInt(totalGES[0].total);
    console.log(`Total GES Activos: ${colors.green}${totalActivo}${colors.reset}`);

    // 2. DISTRIBUCIÓN POR CATEGORÍA
    console.log(`\n${colors.blue}[2] DISTRIBUCIÓN POR CATEGORÍA DE RIESGO${colors.reset}`);
    console.log('━'.repeat(60));

    const distribucionCategorias = [];
    for (const cat of CATEGORIAS_RIESGO) {
      const riesgo = await knex('catalogo_riesgos')
        .where('codigo', cat.codigo)
        .first();

      if (!riesgo) {
        console.log(`${colors.red}❌ Categoría ${cat.codigo} no existe en BD${colors.reset}`);
        continue;
      }

      const count = await knex('catalogo_ges')
        .where('riesgo_id', riesgo.id)
        .where('activo', true)
        .count('id as total');

      const totalCat = parseInt(count[0].total);
      const cumple = totalCat >= cat.minimo;
      const status = cumple ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;

      console.log(`${status} ${cat.codigo.padEnd(5)} - ${cat.nombre.padEnd(28)} | ${totalCat.toString().padStart(3)} GES (mín: ${cat.minimo})`);

      distribucionCategorias.push({
        categoria: cat.codigo,
        nombre: cat.nombre,
        total: totalCat,
        minimo: cat.minimo,
        cumple,
        gap: Math.max(0, cat.minimo - totalCat)
      });
    }

    // 3. VERIFICAR GES CRÍTICOS OBLIGATORIOS
    console.log(`\n${colors.blue}[3] GES CRÍTICOS OBLIGATORIOS (COMPLIANCE LEGAL)${colors.reset}`);
    console.log('━'.repeat(60));

    const gesEncontrados = [];
    const gesFaltantes = [];

    for (const gesObl of GES_OBLIGATORIOS_LEGALES) {
      const existe = await knex('catalogo_ges')
        .where('codigo', gesObl.codigo)
        .where('activo', true)
        .first();

      if (existe) {
        console.log(`${colors.green}✓${colors.reset} ${gesObl.codigo.padEnd(18)} - ${gesObl.nombre.padEnd(25)} [${gesObl.ley}]`);
        gesEncontrados.push(gesObl);
      } else {
        console.log(`${colors.red}✗${colors.reset} ${gesObl.codigo.padEnd(18)} - ${gesObl.nombre.padEnd(25)} [${gesObl.ley}]`);
        gesFaltantes.push(gesObl);
      }
    }

    // 4. COMPLETITUD DE DATOS
    console.log(`\n${colors.blue}[4] COMPLETITUD DE DATOS (CALIDAD)${colors.reset}`);
    console.log('━'.repeat(60));

    const gesCompletos = await knex('catalogo_ges')
      .where('activo', true)
      .whereNotNull('nombre')
      .whereNotNull('consecuencias')
      .whereNotNull('peor_consecuencia')
      .whereNotNull('examenes_medicos')
      .count('id as total');

    const completitud = (parseInt(gesCompletos[0].total) / totalActivo * 100).toFixed(1);
    const statusCompletitud = completitud >= 95 ? colors.green : completitud >= 80 ? colors.yellow : colors.red;

    console.log(`GES con datos completos: ${statusCompletitud}${gesCompletos[0].total}/${totalActivo} (${completitud}%)${colors.reset}`);

    // Campos específicos
    const camposAuditar = [
      { campo: 'nombre', requerido: true },
      { campo: 'consecuencias', requerido: true },
      { campo: 'peor_consecuencia', requerido: true },
      { campo: 'examenes_medicos', requerido: true },
      { campo: 'medidas_intervencion', requerido: false },
      { campo: 'epp_sugeridos', requerido: false },
      { campo: 'aptitudes_requeridas', requerido: false }
    ];

    for (const auditoria of camposAuditar) {
      const conDato = await knex('catalogo_ges')
        .where('activo', true)
        .whereNotNull(auditoria.campo)
        .count('id as total');

      const porcentaje = (parseInt(conDato[0].total) / totalActivo * 100).toFixed(1);
      const status = auditoria.requerido && porcentaje < 100 ? colors.red : colors.green;
      const icono = porcentaje >= 95 ? '✓' : '⚠';

      console.log(`  ${icono} ${auditoria.campo.padEnd(35)}: ${status}${porcentaje}%${colors.reset} (${conDato[0].total}/${totalActivo})`);
    }

    // 5. DUPLICADOS O REDUNDANCIAS
    console.log(`\n${colors.blue}[5] ANÁLISIS DE DUPLICADOS${colors.reset}`);
    console.log('━'.repeat(60));

    const duplicados = await knex('catalogo_ges')
      .select('nombre')
      .count('id as total')
      .where('activo', true)
      .groupBy('nombre')
      .having(knex.raw('count(id) > 1'));

    if (duplicados.length === 0) {
      console.log(`${colors.green}✓ No se encontraron duplicados por nombre${colors.reset}`);
    } else {
      console.log(`${colors.yellow}⚠ Se encontraron ${duplicados.length} nombres duplicados:${colors.reset}`);
      duplicados.forEach(dup => {
        console.log(`  - "${dup.nombre}" (${dup.total} veces)`);
      });
    }

    // 6. GES POR SECTOR ECONÓMICO (ANÁLISIS AVANZADO)
    console.log(`\n${colors.blue}[6] COBERTURA POR SECTOR ECONÓMICO${colors.reset}`);
    console.log('━'.repeat(60));

    const sectoresAnalizar = [
      { sector: 'Salud', palabrasClave: ['biológico', 'sangre', 'patógeno', 'quirúrgico', 'radiación', 'virus', 'bacteria'] },
      { sector: 'Construcción', palabrasClave: ['alturas', 'excavación', 'maquinaria pesada', 'derrumbe', 'andamio', 'polvo'] },
      { sector: 'Minería', palabrasClave: ['derrumbe', 'gases tóxicos', 'explosión', 'carbón', 'silicosis', 'neumoconiosis'] },
      { sector: 'Agricultura', palabrasClave: ['plaguicida', 'pesticida', 'herbicida', 'insolación', 'serpiente', 'zoonosis'] },
      { sector: 'Call Center/BPO', palabrasClave: ['burnout', 'fatiga visual', 'túnel carpiano', 'estrés', 'sedentarismo'] }
    ];

    for (const sector of sectoresAnalizar) {
      let gesEncontradosSector = [];

      for (const palabra of sector.palabrasClave) {
        const gesRelacionados = await knex('catalogo_ges')
          .where('activo', true)
          .where(function() {
            this.where('nombre', 'ilike', `%${palabra}%`)
                .orWhere('consecuencias', 'ilike', `%${palabra}%`);
          });

        gesEncontradosSector = [...gesEncontradosSector, ...gesRelacionados];
      }

      // Eliminar duplicados
      const gesUnicos = [...new Set(gesEncontradosSector.map(g => g.id))];
      const cobertura = gesUnicos.length;
      const status = cobertura >= 5 ? colors.green : cobertura >= 3 ? colors.yellow : colors.red;

      console.log(`  ${sector.sector.padEnd(22)}: ${status}${cobertura} GES relacionados${colors.reset}`);
    }

    // 7. CALIFICACIÓN FINAL
    console.log(`\n${colors.blue}[7] CALIFICACIÓN FINAL DE COMPLIANCE${colors.reset}`);
    console.log('━'.repeat(60));

    const criterios = [
      {
        nombre: 'GES Totales (≥80)',
        peso: 20,
        valor: totalActivo >= 80 ? 100 : (totalActivo / 80 * 100)
      },
      {
        nombre: 'Distribución Categorías',
        peso: 20,
        valor: (distribucionCategorias.filter(c => c.cumple).length / CATEGORIAS_RIESGO.length * 100)
      },
      {
        nombre: 'GES Críticos Legales',
        peso: 30,
        valor: (gesEncontrados.length / GES_OBLIGATORIOS_LEGALES.length * 100)
      },
      {
        nombre: 'Completitud Datos',
        peso: 20,
        valor: parseFloat(completitud)
      },
      {
        nombre: 'Sin Duplicados',
        peso: 10,
        valor: duplicados.length === 0 ? 100 : Math.max(0, 100 - duplicados.length * 10)
      }
    ];

    let notaFinal = 0;
    criterios.forEach(c => {
      const puntos = (c.peso * c.valor / 100).toFixed(1);
      const statusCrit = c.valor >= 80 ? colors.green : c.valor >= 60 ? colors.yellow : colors.red;
      console.log(`  ${c.nombre.padEnd(28)} (${c.peso}%): ${statusCrit}${c.valor.toFixed(1)}% → ${puntos} pts${colors.reset}`);
      notaFinal += parseFloat(puntos);
    });

    console.log('━'.repeat(60));
    const statusFinal = notaFinal >= 80 ? colors.green : notaFinal >= 60 ? colors.yellow : colors.red;
    console.log(`  ${colors.white}CALIFICACIÓN FINAL: ${statusFinal}${notaFinal.toFixed(1)}/100${colors.reset}`);

    let nivelCompliance = '';
    if (notaFinal >= 90) nivelCompliance = `${colors.green}EXCELENTE - Compliance Total${colors.reset}`;
    else if (notaFinal >= 80) nivelCompliance = `${colors.green}BUENO - Compliance Alto${colors.reset}`;
    else if (notaFinal >= 70) nivelCompliance = `${colors.yellow}ACEPTABLE - Mejoras Requeridas${colors.reset}`;
    else if (notaFinal >= 60) nivelCompliance = `${colors.yellow}MODERADO - Gaps Críticos${colors.reset}`;
    else nivelCompliance = `${colors.red}INSUFICIENTE - Blocker Legal${colors.reset}`;

    console.log(`  ${colors.white}NIVEL: ${nivelCompliance}${colors.reset}\n`);

    // 8. GENERAR REPORTE MARKDOWN
    console.log(`${colors.cyan}[8] Generando reporte markdown...${colors.reset}`);

    const reporteMarkdown = generarReporteMarkdown({
      totalActivo,
      distribucionCategorias,
      gesEncontrados,
      gesFaltantes,
      completitud,
      duplicados,
      criterios,
      notaFinal
    });

    const fs = require('fs');
    const path = require('path');
    const reportePath = path.join(__dirname, '..', 'AUDITORIA_CATALOGO_GES_SST.md');
    fs.writeFileSync(reportePath, reporteMarkdown, 'utf8');

    console.log(`${colors.green}✓ Reporte guardado en: ${reportePath}${colors.reset}\n`);

  } catch (error) {
    console.error(`${colors.red}Error en auditoría:${colors.reset}`, error);
  } finally {
    await knex.destroy();
  }
}

function generarReporteMarkdown(data) {
  const fecha = new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let md = `# AUDITORÍA CATÁLOGO GES - COMPLIANCE SST COLOMBIA

**Fecha de Auditoría**: ${fecha}
**Auditor**: Sistema Automatizado de Compliance SST
**Marco Legal**: GTC 45:2012, Res. 2607/2024, Res. 350/2022
**Calificación Final**: **${data.notaFinal.toFixed(1)}/100**

---

## RESUMEN EJECUTIVO

### Estado General del Catálogo

| Métrica | Valor | Estado |
|---------|-------|--------|
| **Total GES Activos** | ${data.totalActivo} | ${data.totalActivo >= 80 ? '✅ OK' : '⚠️ Insuficiente'} |
| **Completitud de Datos** | ${data.completitud}% | ${parseFloat(data.completitud) >= 95 ? '✅ Excelente' : parseFloat(data.completitud) >= 80 ? '⚠️ Aceptable' : '❌ Crítico'} |
| **GES Críticos Legales** | ${data.gesEncontrados.length}/${GES_OBLIGATORIOS_LEGALES.length} | ${data.gesEncontrados.length === GES_OBLIGATORIOS_LEGALES.length ? '✅ Completo' : '❌ Faltantes'} |
| **Categorías Completas** | ${data.distribucionCategorias.filter(c => c.cumple).length}/${CATEGORIAS_RIESGO.length} | ${data.distribucionCategorias.filter(c => c.cumple).length === CATEGORIAS_RIESGO.length ? '✅ Todas' : '⚠️ Gaps'} |
| **Duplicados Detectados** | ${data.duplicados.length} | ${data.duplicados.length === 0 ? '✅ Ninguno' : '⚠️ Revisar'} |

### Nivel de Compliance

`;

  if (data.notaFinal >= 90) {
    md += `**🟢 EXCELENTE** - El catálogo cumple con todos los requisitos de compliance legal para SST en Colombia.\n\n`;
  } else if (data.notaFinal >= 80) {
    md += `**🟢 BUENO** - El catálogo tiene un alto nivel de compliance, con mejoras menores recomendadas.\n\n`;
  } else if (data.notaFinal >= 70) {
    md += `**🟡 ACEPTABLE** - El catálogo es funcional pero requiere mejoras para compliance total.\n\n`;
  } else if (data.notaFinal >= 60) {
    md += `**🟡 MODERADO** - El catálogo tiene gaps críticos que deben ser atendidos.\n\n`;
  } else {
    md += `**🔴 INSUFICIENTE** - El catálogo NO cumple con requisitos mínimos de compliance legal.\n\n`;
  }

  md += `---

## 1. DISTRIBUCIÓN POR CATEGORÍA DE RIESGO

| Categoría | Código | GES Actuales | Mínimo Requerido | Gap | Estado |
|-----------|--------|--------------|------------------|-----|--------|
`;

  data.distribucionCategorias.forEach(cat => {
    const status = cat.cumple ? '✅' : '❌';
    md += `| ${cat.nombre} | ${cat.codigo} | ${cat.total} | ${cat.minimo} | ${cat.gap} | ${status} |\n`;
  });

  md += `\n### Análisis de Distribución

`;

  const categoriasFaltantes = data.distribucionCategorias.filter(c => !c.cumple);
  if (categoriasFaltantes.length === 0) {
    md += `✅ **Todas las categorías cumplen** con el mínimo de GES requerido según GTC 45:2012.\n\n`;
  } else {
    md += `⚠️ **${categoriasFaltantes.length} categorías con déficit**:\n\n`;
    categoriasFaltantes.forEach(cat => {
      md += `- **${cat.nombre} (${cat.codigo})**: Faltan **${cat.gap} GES** para alcanzar mínimo de ${cat.minimo}\n`;
    });
    md += `\n`;
  }

  md += `---

## 2. GES CRÍTICOS OBLIGATORIOS (COMPLIANCE LEGAL)

### GES Encontrados

`;

  if (data.gesEncontrados.length > 0) {
    data.gesEncontrados.forEach(ges => {
      md += `✅ **${ges.codigo}** - ${ges.nombre} (${ges.ley})\n`;
    });
  } else {
    md += `❌ No se encontraron GES obligatorios\n`;
  }

  md += `\n### GES Faltantes (CRÍTICO)

`;

  if (data.gesFaltantes.length === 0) {
    md += `✅ **Todos los GES críticos obligatorios están presentes** en el catálogo.\n\n`;
  } else {
    md += `🚨 **ATENCIÓN**: Los siguientes GES son **OBLIGATORIOS** por ley colombiana y **NO** se encuentran en el catálogo:\n\n`;
    data.gesFaltantes.forEach(ges => {
      md += `❌ **${ges.codigo}** - ${ges.nombre}\n`;
      md += `   - **Regulación**: ${ges.ley}\n`;
      md += `   - **Riesgo Legal**: Alto - Incumplimiento normativo\n\n`;
    });
  }

  md += `### Marco Legal de Referencia

- **Ley 1010/2006**: Acoso laboral (Comité de Convivencia obligatorio)
- **Ley 1257/2008**: Acoso sexual (Protocolo de prevención obligatorio)
- **Resolución 2844/2007**: Prohibición de asbesto/amianto
- **Resolución 350/2022**: Vigilancia de salud + COVID-19
- **Resolución 1409/2012**: Trabajo en alturas (certificación obligatoria)
- **Resolución 491/2020**: Espacios confinados
- **Resolución 412/2000**: Hepatitis B (vacunación obligatoria sector salud)
- **Resolución 2646/2008**: Riesgo psicosocial (Batería obligatoria)

---

## 3. COMPLETITUD DE DATOS (CALIDAD)

### Resumen General

**Completitud Total**: ${data.completitud}% de GES con todos los campos obligatorios llenos.

`;

  if (parseFloat(data.completitud) >= 95) {
    md += `✅ **Excelente** - Prácticamente todos los GES tienen datos completos.\n\n`;
  } else if (parseFloat(data.completitud) >= 80) {
    md += `⚠️ **Aceptable** - La mayoría de GES tienen datos completos, pero hay mejoras por hacer.\n\n`;
  } else {
    md += `❌ **Crítico** - Un porcentaje significativo de GES tienen datos incompletos.\n\n`;
  }

  md += `### Campos Obligatorios

Los siguientes campos son **obligatorios** para que un GES sea funcional:

- ✅ **nombre**: Identificación clara del riesgo
- ✅ **consecuencias**: Efectos en salud del trabajador
- ✅ **peor_consecuencia**: Peor escenario posible (para priorización)
- ✅ **examenes_medicos**: Exámenes médicos ocupacionales requeridos

### Recomendaciones de Completitud

`;

  if (parseFloat(data.completitud) < 100) {
    md += `1. **Revisar GES con campos vacíos** y completar información faltante\n`;
    md += `2. **Validar formato JSON** en campo \`examenes_medicos\`\n`;
    md += `3. **Estandarizar redacción** de consecuencias (lenguaje médico técnico)\n`;
    md += `4. **Agregar efectos_salud** para enriquecer perfiles de cargo\n\n`;
  } else {
    md += `✅ Todos los GES tienen los campos obligatorios completos.\n\n`;
  }

  md += `---

## 4. DUPLICADOS Y REDUNDANCIAS

`;

  if (data.duplicados.length === 0) {
    md += `✅ **No se detectaron duplicados** en el catálogo.\n\n`;
  } else {
    md += `⚠️ Se encontraron **${data.duplicados.length} nombres duplicados**:\n\n`;
    data.duplicados.forEach(dup => {
      md += `- **"${dup.nombre}"** aparece ${dup.total} veces\n`;
    });
    md += `\n**Recomendación**: Revisar si son duplicados reales o variantes legítimas. Si son duplicados, consolidar en un solo GES con códigos alternativos.\n\n`;
  }

  md += `---

## 5. CALIFICACIÓN POR CRITERIOS

| Criterio | Peso | Valor | Puntos |
|----------|------|-------|--------|
`;

  data.criterios.forEach(c => {
    const puntos = (c.peso * c.valor / 100).toFixed(1);
    md += `| ${c.nombre} | ${c.peso}% | ${c.valor.toFixed(1)}% | ${puntos} |\n`;
  });

  md += `| **TOTAL** | **100%** | - | **${data.notaFinal.toFixed(1)}** |

### Interpretación de Criterios

1. **GES Totales (≥80)**: Cantidad mínima de GES para cobertura razonable de sectores económicos
2. **Distribución Categorías**: Todas las 8 categorías GTC 45 deben tener mínimo de GES
3. **GES Críticos Legales**: Riesgos obligatorios por ley colombiana (alta prioridad)
4. **Completitud Datos**: Calidad de información en cada GES
5. **Sin Duplicados**: Eficiencia del catálogo (sin redundancia)

---

## 6. RECOMENDACIONES PRIORITARIAS

### 🚨 CRÍTICO (Implementar de inmediato)

`;

  if (data.gesFaltantes.length > 0) {
    md += `1. **Agregar ${data.gesFaltantes.length} GES obligatorios faltantes**\n`;
    data.gesFaltantes.forEach(ges => {
      md += `   - ${ges.codigo}: ${ges.nombre} (${ges.ley})\n`;
    });
    md += `\n`;
  }

  const catCriticas = data.distribucionCategorias.filter(c => !c.cumple && c.gap > 5);
  if (catCriticas.length > 0) {
    md += `2. **Completar categorías con gaps críticos**\n`;
    catCriticas.forEach(cat => {
      md += `   - ${cat.nombre}: Agregar ${cat.gap} GES\n`;
    });
    md += `\n`;
  }

  md += `### ⚠️ ALTA PRIORIDAD (Implementar en 2 semanas)

`;

  const catAltas = data.distribucionCategorias.filter(c => !c.cumple && c.gap <= 5);
  if (catAltas.length > 0) {
    md += `1. **Completar categorías con gaps menores**\n`;
    catAltas.forEach(cat => {
      md += `   - ${cat.nombre}: Agregar ${cat.gap} GES\n`;
    });
    md += `\n`;
  }

  if (parseFloat(data.completitud) < 95) {
    md += `2. **Mejorar completitud de datos**\n`;
    md += `   - Meta: ≥95% de GES con todos los campos obligatorios\n\n`;
  }

  if (data.duplicados.length > 0) {
    md += `3. **Resolver duplicados**\n`;
    md += `   - Revisar ${data.duplicados.length} nombres duplicados y consolidar\n\n`;
  }

  md += `### 📋 MEDIA PRIORIDAD (Implementar en 1 mes)

1. **Agregar GES sector-específicos**
   - Salud: Riesgos de quirófano, rayos X, quimioterapia
   - Construcción: Riesgos de maquinaria pesada, excavaciones
   - Minería: Gases tóxicos, derrumbes, neumoconiosis
   - Agricultura: Plaguicidas, zoonosis, insolación
   - Call Centers: Burnout, fatiga visual, túnel carpiano

2. **Enriquecer campos opcionales**
   - Agregar \`medidas_control_propuestas\` en todos los GES
   - Agregar \`efectos_salud\` con lenguaje médico técnico
   - Agregar \`sectores_aplicables\` para filtrado inteligente

3. **Validar compliance con Res. 2607/2024**
   - Nueva resolución de identificación de peligros (2024)
   - Verificar alineación metodológica

---

## 7. SECTORES ECONÓMICOS (COBERTURA)

### Análisis de Cobertura por Sector

`;

  const sectoresEjemplo = [
    { sector: 'Salud', gesRecomendados: 15, descripcion: 'Riesgos biológicos, radiación, violencia de pacientes, burnout' },
    { sector: 'Construcción', gesRecomendados: 18, descripcion: 'Alturas, maquinaria pesada, excavaciones, silicosis' },
    { sector: 'Minería', gesRecomendados: 12, descripcion: 'Derrumbes, gases tóxicos, neumoconiosis, explosiones' },
    { sector: 'Agricultura', gesRecomendados: 10, descripcion: 'Plaguicidas, zoonosis, insolación, picaduras' },
    { sector: 'Call Center/BPO', gesRecomendados: 8, descripcion: 'Burnout, fatiga visual, túnel carpiano, estrés' },
    { sector: 'Manufactura', gesRecomendados: 14, descripcion: 'Maquinaria, químicos, ruido, repetitividad' },
    { sector: 'Oficinas/Administrativo', gesRecomendados: 6, descripcion: 'Sedentarismo, fatiga visual, estrés, ergonomía' }
  ];

  sectoresEjemplo.forEach(s => {
    md += `#### ${s.sector}\n\n`;
    md += `**GES Recomendados**: ${s.gesRecomendados}  \n`;
    md += `**Riesgos Típicos**: ${s.descripcion}\n\n`;
  });

  md += `**Recomendación General**: Crear una tabla de mapeo \`ges_sectores\` para asociar GES con sectores económicos y facilitar filtrado inteligente en el wizard.

---

## 8. COMPARACIÓN CON ESTÁNDARES

### GTC 45:2012 - Anexo A

El Anexo A de la GTC 45 contiene aproximadamente **35 peligros base** como ejemplos. La guía establece:

> "Este cuadro no es un listado exhaustivo. Las organizaciones deberían desarrollar su propia lista de peligros tomando en cuenta el carácter de sus actividades laborales."

**Estado Actual**: ${data.totalActivo} GES → **${(data.totalActivo / 35 * 100).toFixed(0)}%** más exhaustivo que el Anexo A base.

`;

  if (data.totalActivo >= 80) {
    md += `✅ El catálogo supera ampliamente los ejemplos base de GTC 45.\n\n`;
  } else {
    md += `⚠️ Se recomienda alcanzar al menos 80 GES para cobertura razonable de sectores colombianos.\n\n`;
  }

  md += `### Resolución 2607/2024

Nueva resolución que actualiza la metodología de identificación de peligros. Requiere:

- ✅ Metodología basada en GTC 45 (cumple)
- ✅ Clasificación por categorías de riesgo (cumple)
- ⚠️ Revisión anual de matriz de riesgos (pendiente validar trazabilidad)
- ⚠️ Campos de metadatos (fecha última actualización, responsable)

### Resolución 350/2022 (Post-COVID)

Establece vigilancia epidemiológica y protocolos de bioseguridad:

- ${data.gesEncontrados.some(g => g.codigo === 'RBL-COVID19') ? '✅' : '❌'} COVID-19 en catálogo de riesgos biológicos
- ⚠️ Protocolo de bioseguridad en controles sugeridos

---

## 9. CONCLUSIONES

### Fortalezas

`;

  const fortalezas = [];
  if (data.totalActivo >= 80) fortalezas.push(`Catálogo robusto con ${data.totalActivo} GES (supera ampliamente los 35 ejemplos de GTC 45)`);
  if (parseFloat(data.completitud) >= 80) fortalezas.push(`Alta completitud de datos (${data.completitud}%)`);
  if (data.duplicados.length === 0) fortalezas.push('Sin duplicados detectados');
  if (data.distribucionCategorias.filter(c => c.cumple).length >= 6) fortalezas.push('Buena distribución entre categorías de riesgo');

  if (fortalezas.length > 0) {
    fortalezas.forEach((f, i) => {
      md += `${i + 1}. ${f}\n`;
    });
  } else {
    md += `- Se requieren mejoras significativas en múltiples áreas\n`;
  }

  md += `\n### Debilidades

`;

  const debilidades = [];
  if (data.gesFaltantes.length > 0) debilidades.push(`Faltan ${data.gesFaltantes.length} GES críticos obligatorios por ley`);
  if (data.totalActivo < 80) debilidades.push(`Catálogo insuficiente (${data.totalActivo} GES, recomendado: ≥80)`);
  const catFaltantes = data.distribucionCategorias.filter(c => !c.cumple).length;
  if (catFaltantes > 0) debilidades.push(`${catFaltantes} categorías no cumplen mínimo de GES`);
  if (parseFloat(data.completitud) < 80) debilidades.push(`Completitud de datos baja (${data.completitud}%)`);
  if (data.duplicados.length > 0) debilidades.push(`${data.duplicados.length} nombres duplicados`);

  if (debilidades.length > 0) {
    debilidades.forEach((d, i) => {
      md += `${i + 1}. ${d}\n`;
    });
  } else {
    md += `- No se identificaron debilidades críticas\n`;
  }

  md += `\n### Riesgo Legal

`;

  if (data.notaFinal >= 80) {
    md += `**🟢 BAJO** - El catálogo cumple con los requisitos mínimos de compliance legal.\n\n`;
  } else if (data.notaFinal >= 60) {
    md += `**🟡 MODERADO** - Existen gaps que podrían generar observaciones en auditorías ARL o del Ministerio de Trabajo.\n\n`;
  } else {
    md += `**🔴 ALTO** - El catálogo tiene deficiencias críticas que representan un blocker legal:\n\n`;
    md += `- Matrices incompletas pueden ser rechazadas en auditorías\n`;
    md += `- Exposición a demandas laborales (riesgos no identificados)\n`;
    md += `- Multas por incumplimiento de SG-SST\n`;
    md += `- Rechazo de documentos por clientes empresariales/gubernamentales\n\n`;
  }

  md += `### Ventaja Competitiva

`;

  if (data.totalActivo >= 100) {
    md += `✅ **Diferenciador fuerte**: Con ${data.totalActivo} GES, Genesys tiene el catálogo más completo del mercado colombiano (competidores típicamente usan 35-50 GES base).\n\n`;
  } else if (data.totalActivo >= 80) {
    md += `⚠️ **Ventaja moderada**: Con ${data.totalActivo} GES, el catálogo es competitivo pero podría ampliarse para diferenciación mayor.\n\n`;
  } else {
    md += `❌ **Sin ventaja**: Con ${data.totalActivo} GES, el catálogo es similar o inferior a competidores. Se recomienda expansión urgente.\n\n`;
  }

  md += `---

## 10. PRÓXIMOS PASOS

### Acción Inmediata (Esta Semana)

`;

  if (data.gesFaltantes.length > 0) {
    md += `1. ✅ **Agregar GES críticos obligatorios**\n`;
    md += `   - Crear seed file con ${data.gesFaltantes.length} GES faltantes\n`;
    md += `   - Prioridad: Acoso laboral, acoso sexual, asbesto, COVID-19\n\n`;
  }

  if (catCriticas.length > 0) {
    md += `2. ⚠️ **Completar categorías críticas**\n`;
    catCriticas.forEach(cat => {
      md += `   - ${cat.nombre}: Agregar ${cat.gap} GES\n`;
    });
    md += `\n`;
  }

  md += `### Corto Plazo (2 Semanas)

1. Completar todas las categorías al mínimo requerido
2. Mejorar completitud de datos al ≥95%
3. Resolver duplicados detectados
4. Agregar campo \`nivel_compliance\` (básico/obligatorio/sector_especifico)

### Mediano Plazo (1 Mes)

1. Alcanzar meta de 100+ GES para ventaja competitiva
2. Agregar GES sector-específicos (salud, construcción, minería, etc.)
3. Crear tabla de mapeo \`ges_sectores\` para filtrado inteligente
4. Validar compliance con Res. 2607/2024
5. Implementar wizard de upgrade para clientes con matrices antiguas

---

## ANEXOS

### A. Referencias Normativas

- **GTC 45:2012** - Guía Técnica Colombiana para Identificación de Peligros y Valoración de Riesgos
- **Resolución 2607/2024** - Identificación de peligros (nueva metodología)
- **Resolución 1890/2025** - Lineamientos generales SG-SST
- **Resolución 350/2022** - Vigilancia de salud + bioseguridad (COVID-19)
- **Ley 1010/2006** - Acoso laboral (Comité de Convivencia)
- **Ley 1257/2008** - Violencia contra la mujer (acoso sexual laboral)
- **Resolución 2844/2007** - Prohibición de asbesto/amianto
- **Resolución 1409/2012** - Trabajo en alturas
- **Resolución 491/2020** - Espacios confinados
- **Resolución 2646/2008** - Riesgo psicosocial (Batería)
- **Circular 009/2025** - Autoevaluación SG-SST (deadline: 28 marzo 2025)

### B. Contacto

Para consultas técnicas sobre esta auditoría, contactar al equipo de desarrollo de Genesys.

---

**Generado automáticamente por**: Script de Auditoría de Compliance SST
**Versión del script**: 1.0
**Fecha de generación**: ${fecha}
**Confidencialidad**: Interno - Genesys Team

`;

  return md;
}

// Ejecutar auditoría
auditarCatalogo();
