#!/usr/bin/env node

/**
 * Script para auditar ges-config.js
 * Identifica GES con datos incompletos
 */

import { GES_DATOS_PREDEFINIDOS } from '../server/src/config/ges-config.js';

const requiredFields = [
  'consecuencias',
  'peorConsecuencia',
  'examenesMedicos',
  'aptitudesRequeridas',
  'condicionesIncompatibles',
  'eppSugeridos',
  'medidasIntervencion'
];

const requiredMedidasIntervencion = [
  'eliminacion',
  'sustitucion',
  'controlesIngenieria',
  'controlesAdministrativos'
];

console.log('📋 AUDITORÍA DE GES-CONFIG.JS\n');
console.log(`Total de GES: ${Object.keys(GES_DATOS_PREDEFINIDOS).length}\n`);

let completos = 0;
let incompletos = 0;
const gesIncompletos = [];

Object.entries(GES_DATOS_PREDEFINIDOS).forEach(([nombre, datos]) => {
  const camposFaltantes = [];

  // Verificar campos requeridos
  requiredFields.forEach(field => {
    if (!datos[field]) {
      camposFaltantes.push(field);
    } else if (field === 'medidasIntervencion') {
      // Verificar sub-campos de medidasIntervencion
      requiredMedidasIntervencion.forEach(subfield => {
        if (!datos[field][subfield]) {
          camposFaltantes.push(`medidasIntervencion.${subfield}`);
        }
      });
    }
  });

  if (camposFaltantes.length === 0) {
    completos++;
  } else {
    incompletos++;
    gesIncompletos.push({ nombre, camposFaltantes });
  }
});

console.log(`✅ GES COMPLETOS: ${completos}`);
console.log(`❌ GES INCOMPLETOS: ${incompletos}\n`);

if (gesIncompletos.length > 0) {
  console.log('🔴 GES CON DATOS INCOMPLETOS:\n');
  gesIncompletos.forEach(({ nombre, camposFaltantes }) => {
    console.log(`❌ "${nombre}"`);
    console.log(`   Campos faltantes: ${camposFaltantes.join(', ')}\n`);
  });
}

// Listar todos los nombres de GES
console.log('\n📝 LISTA COMPLETA DE GES:\n');
Object.keys(GES_DATOS_PREDEFINIDOS).forEach((nombre, index) => {
  const isComplete = !gesIncompletos.find(g => g.nombre === nombre);
  console.log(`${index + 1}. ${isComplete ? '✅' : '❌'} ${nombre}`);
});

console.log('\n✨ Auditoría completada');
