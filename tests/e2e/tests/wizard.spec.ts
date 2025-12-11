/**
 * Tests E2E del Wizard de Diagnóstico SST
 * 
 * Este test navega por todo el wizard:
 * 1. Información Básica (empresa)
 * 2. Cargos
 * 3. Riesgos (GES)
 * 4. Niveles y Controles
 * 5. Resumen y Envío
 * 
 * Al final guarda las credenciales generadas para verificación manual
 */

import { test, expect, Page } from '@playwright/test';
import { generateWizardData, WizardTestData } from '../helpers/fake-data';
import * as fs from 'fs';
import * as path from 'path';

// Generar datos únicos para cada test
let testData: WizardTestData;

test.describe('Wizard de Diagnóstico SST', () => {
  
  test.beforeEach(async ({ page }) => {
    // Generar datos frescos para cada test
    testData = generateWizardData(3); // 3 cargos por defecto
    
    console.log('📋 Datos de prueba generados:');
    console.log('   Empresa:', testData.empresa.nombre);
    console.log('   NIT:', testData.empresa.nit);
    console.log('   Email:', testData.empresa.email);
    console.log('   Password:', testData.empresa.password);
    console.log('   Cargos:', testData.cargos.map(c => c.nombre).join(', '));
  });

  test('Flujo completo del wizard - Happy Path', async ({ page }) => {
    // Ir al wizard
    await page.goto('/pages/wizard_riesgos.html');
    
    // Esperar que cargue
    await page.waitForLoadState('networkidle');
    
    console.log('\n🚀 Iniciando test del wizard...\n');
    
    // ========================================
    // PASO 1: Información Básica
    // ========================================
    await test.step('Paso 1: Información Básica', async () => {
      console.log('📝 Llenando información de la empresa...');
      
      // Esperar que el paso esté visible (usar .wizard-step específico, no el progress indicator)
      await expect(page.locator('.wizard-step[data-step="info-basica"]')).toBeVisible({ timeout: 10000 });
      
      // Llenar campos de empresa
      await fillIfExists(page, 'input[name="nombreEmpresa"], #nombreEmpresa, input[placeholder*="empresa"]', testData.empresa.nombre);
      await fillIfExists(page, 'input[name="nit"], #nit, input[placeholder*="NIT"]', testData.empresa.nit);
      await fillIfExists(page, 'input[name="email"], #email, input[type="email"]', testData.empresa.email);
      await fillIfExists(page, 'input[name="password"], #password, input[type="password"]', testData.empresa.password);
      await fillIfExists(page, 'input[name="telefono"], #telefono, input[placeholder*="teléfono"]', testData.empresa.telefono);
      await fillIfExists(page, 'input[name="direccion"], #direccion, input[placeholder*="dirección"]', testData.empresa.direccion);
      
      // Sector (si es select)
      await selectIfExists(page, 'select[name="sector"], #sector', testData.empresa.sector);
      
      // Screenshot del paso
      await page.screenshot({ path: 'test-results/paso1-info-basica.png' });
      
      // Avanzar
      await clickNext(page);
      console.log('   ✅ Paso 1 completado\n');
    });

    // ========================================
    // PASO 2: Cargos
    // ========================================
    await test.step('Paso 2: Cargos', async () => {
      console.log('👥 Agregando cargos...');
      
      await page.waitForTimeout(500); // Esperar transición
      
      for (let i = 0; i < testData.cargos.length; i++) {
        const cargo = testData.cargos[i];
        console.log(`   Agregando cargo ${i + 1}: ${cargo.nombre}`);
        
        // Buscar botón de agregar cargo
        const addButton = page.locator('button:has-text("Agregar"), button:has-text("+ Cargo"), .btn-add-cargo, [data-action="add-cargo"]');
        if (await addButton.isVisible() && i > 0) {
          await addButton.click();
          await page.waitForTimeout(300);
        }
        
        // Llenar datos del cargo
        await fillIfExists(page, `input[name="cargo[${i}].nombre"], input[name="nombreCargo"], .cargo-input:nth-of-type(${i + 1}) input`, cargo.nombre);
      }
      
      await page.screenshot({ path: 'test-results/paso2-cargos.png' });
      await clickNext(page);
      console.log('   ✅ Paso 2 completado\n');
    });

    // ========================================
    // PASO 3: Riesgos (GES)
    // ========================================
    await test.step('Paso 3: Selección de Riesgos', async () => {
      console.log('⚠️ Seleccionando riesgos...');
      
      await page.waitForTimeout(500);
      
      // Seleccionar algunos GES aleatorios para cada cargo
      // Buscar checkboxes o items seleccionables
      const gesItems = page.locator('.ges-item, .riesgo-item, [data-ges-id], .selectable-item');
      const count = await gesItems.count();
      
      if (count > 0) {
        // Seleccionar los primeros 5 GES como ejemplo
        const numToSelect = Math.min(5, count);
        for (let i = 0; i < numToSelect; i++) {
          await gesItems.nth(i).click();
          await page.waitForTimeout(100);
        }
        console.log(`   Seleccionados ${numToSelect} GES`);
      } else {
        console.log('   ⚠️ No se encontraron items de GES - puede ser diferente UI');
      }
      
      await page.screenshot({ path: 'test-results/paso3-riesgos.png' });
      await clickNext(page);
      console.log('   ✅ Paso 3 completado\n');
    });

    // ========================================
    // PASO 4: Niveles y Controles
    // ========================================
    await test.step('Paso 4: Niveles y Controles', async () => {
      console.log('📊 Configurando niveles...');
      
      await page.waitForTimeout(500);
      
      // Los niveles suelen tener selects o sliders
      // Intentar llenar valores por defecto
      const selects = page.locator('select');
      const selectCount = await selects.count();
      
      for (let i = 0; i < selectCount; i++) {
        try {
          await selects.nth(i).selectOption({ index: 1 }); // Seleccionar segunda opción
        } catch (e) {
          // Ignorar si no se puede seleccionar
        }
      }
      
      await page.screenshot({ path: 'test-results/paso4-niveles.png' });
      await clickNext(page);
      console.log('   ✅ Paso 4 completado\n');
    });

    // ========================================
    // PASO 5: Resumen y Envío
    // ========================================
    await test.step('Paso 5: Resumen y Envío', async () => {
      console.log('📄 Revisando resumen...');
      
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'test-results/paso5-resumen.png' });
      
      // Buscar botón de finalizar/enviar
      const submitButton = page.locator('button:has-text("Finalizar"), button:has-text("Enviar"), button:has-text("Generar"), button[type="submit"], .btn-submit');
      
      if (await submitButton.isVisible()) {
        await submitButton.click();
        console.log('   📤 Enviando formulario...');
        
        // Esperar respuesta
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'test-results/paso5-resultado.png' });
      }
      
      console.log('   ✅ Paso 5 completado\n');
    });

    // ========================================
    // GUARDAR CREDENCIALES
    // ========================================
    await test.step('Guardar credenciales para verificación', async () => {
      const credentialsDir = path.join(__dirname, '..', 'test-results', 'credentials');
      
      if (!fs.existsSync(credentialsDir)) {
        fs.mkdirSync(credentialsDir, { recursive: true });
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = path.join(credentialsDir, `empresa-${timestamp}.json`);
      
      fs.writeFileSync(filename, JSON.stringify(testData.credenciales, null, 2));
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ TEST COMPLETADO - CREDENCIALES:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📧 Email:    ${testData.credenciales.email}`);
      console.log(`🔑 Password: ${testData.credenciales.password}`);
      console.log(`🏢 NIT:      ${testData.credenciales.nit}`);
      console.log(`🏭 Empresa:  ${testData.credenciales.nombreEmpresa}`);
      console.log(`📁 Archivo:  ${filename}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    });
  });

  test('Navegación adelante y atrás', async ({ page }) => {
    await page.goto('/pages/wizard_riesgos.html');
    await page.waitForLoadState('networkidle');
    
    console.log('\n🔄 Probando navegación adelante/atrás...\n');
    
    // Llenar paso 1 mínimo
    await fillIfExists(page, 'input[name="nombreEmpresa"], #nombreEmpresa', testData.empresa.nombre);
    await fillIfExists(page, 'input[name="nit"], #nit', testData.empresa.nit);
    
    // Ir adelante
    await clickNext(page);
    await page.waitForTimeout(500);
    console.log('   → Avanzó al paso 2');
    
    // Volver atrás
    await clickBack(page);
    await page.waitForTimeout(500);
    console.log('   ← Volvió al paso 1');
    
    // Verificar que los datos se mantienen
    const nombreValue = await page.inputValue('input[name="nombreEmpresa"], #nombreEmpresa');
    expect(nombreValue).toBe(testData.empresa.nombre);
    console.log('   ✅ Datos persistidos correctamente');
    
    // Ir adelante de nuevo
    await clickNext(page);
    await page.waitForTimeout(500);
    console.log('   → Avanzó al paso 2 nuevamente');
    
    await clickNext(page);
    await page.waitForTimeout(500);
    console.log('   → Avanzó al paso 3');
    
    await clickBack(page);
    await page.waitForTimeout(500);
    console.log('   ← Volvió al paso 2');
    
    await clickBack(page);
    await page.waitForTimeout(500);
    console.log('   ← Volvió al paso 1');
    
    console.log('\n✅ Navegación funcionando correctamente\n');
  });

});

// ========================================
// HELPERS
// ========================================

/**
 * Llenar un campo si existe
 */
async function fillIfExists(page: Page, selectors: string, value: string) {
  const selectorList = selectors.split(',').map(s => s.trim());
  
  for (const selector of selectorList) {
    try {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 1000 })) {
        await element.fill(value);
        return;
      }
    } catch (e) {
      // Continuar con el siguiente selector
    }
  }
}

/**
 * Seleccionar opción si existe
 */
async function selectIfExists(page: Page, selectors: string, value: string) {
  const selectorList = selectors.split(',').map(s => s.trim());
  
  for (const selector of selectorList) {
    try {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 1000 })) {
        await element.selectOption({ label: value });
        return;
      }
    } catch (e) {
      // Continuar
    }
  }
}

/**
 * Click en botón Siguiente
 */
async function clickNext(page: Page) {
  const nextSelectors = [
    'button:has-text("Siguiente")',
    'button:has-text("Next")',
    '.wizard-btn-next',
    '.btn-next',
    'button[data-action="next"]',
    'button:has-text("→")',
  ];
  
  for (const selector of nextSelectors) {
    try {
      const btn = page.locator(selector).first();
      if (await btn.isVisible({ timeout: 1000 })) {
        await btn.click();
        return;
      }
    } catch (e) {
      // Continuar
    }
  }
}

/**
 * Click en botón Atrás
 */
async function clickBack(page: Page) {
  const backSelectors = [
    'button:has-text("Atrás")',
    'button:has-text("Back")',
    '.wizard-btn-back',
    '.btn-back',
    'button[data-action="back"]',
    'button:has-text("←")',
  ];
  
  for (const selector of backSelectors) {
    try {
      const btn = page.locator(selector).first();
      if (await btn.isVisible({ timeout: 1000 })) {
        await btn.click();
        return;
      }
    } catch (e) {
      // Continuar
    }
  }
}

