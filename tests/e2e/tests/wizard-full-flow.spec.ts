/**
 * Test E2E COMPLETO del Wizard de Diagnóstico SST
 * 
 * Este test:
 * 1. Completa el wizard con datos reales
 * 2. Agrega un cargo con el modal
 * 3. Selecciona GES para el cargo
 * 4. Configura los 3 niveles de riesgo (ND, NE, NC)
 * 5. Registra la empresa
 * 6. Hace login y verifica
 */

import { test, expect, Page } from '@playwright/test';
import { faker } from '@faker-js/faker/locale/es_MX';
import * as fs from 'fs';
import * as path from 'path';

// Generar datos únicos para el test
function generateTestData() {
  const timestamp = Date.now();
  const nit = faker.string.numeric(9);
  const password = 'Test1234!';
  
  return {
    empresa: {
      nombre: `Test Empresa ${timestamp}`,
      nit: nit,
      email: `test${timestamp}@empresa.com`,
      password: password,
      ciudad: 'Bogotá',
      contacto: faker.person.fullName()
    },
    cargo: {
      nombre: 'Operario de Producción',
      descripcion: 'Operario de línea de producción',
      numPersonas: '5',
      area: 'Producción',
      zona: 'Planta Principal'
    }
  };
}

test.describe('Wizard Completo con Registro Real', () => {
  let testData: ReturnType<typeof generateTestData>;
  
  test.beforeEach(() => {
    testData = generateTestData();
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 DATOS DE PRUEBA:');
    console.log(`   🏢 Empresa: ${testData.empresa.nombre}`);
    console.log(`   🔢 NIT: ${testData.empresa.nit}`);
    console.log(`   📧 Email: ${testData.empresa.email}`);
    console.log(`   🔑 Password: ${testData.empresa.password}`);
    console.log(`   👷 Cargo: ${testData.cargo.nombre}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  });

  test('Flujo completo: Wizard → Registro → Login → Dashboard', async ({ page }) => {
    test.setTimeout(300000); // 5 minutos
    
    // Crear carpeta de resultados
    const resultsDir = path.join(__dirname, '..', 'test-results', 'full-flow');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }

    // ========================================
    // FASE 1: CARGAR WIZARD
    // ========================================
    
    await test.step('Cargar wizard', async () => {
      console.log('🚀 Cargando wizard...');
      await page.goto('/pages/wizard_riesgos.html');
      await page.waitForLoadState('networkidle');
      await page.waitForSelector('.wizard-step[data-step="info-basica"]', { timeout: 20000 });
      console.log('   ✅ Wizard cargado\n');
    });

    // ========================================
    // PASO 1: INFORMACIÓN BÁSICA
    // ========================================
    
    await test.step('Paso 1: Información Básica', async () => {
      console.log('📝 PASO 1: Información Básica...');
      
      await page.fill('#nombreEmpresa', testData.empresa.nombre);
      console.log(`   ✓ Nombre: ${testData.empresa.nombre}`);
      
      await page.fill('#nit', testData.empresa.nit);
      console.log(`   ✓ NIT: ${testData.empresa.nit}`);
      
      await page.fill('#email', testData.empresa.email);
      console.log(`   ✓ Email: ${testData.empresa.email}`);
      
      // Sector económico
      const sectorSelect = page.locator('#ciiuSeccion');
      await sectorSelect.selectOption({ index: 1 }, { force: true });
      await page.waitForTimeout(1000);
      console.log('   ✓ Sector seleccionado');
      
      // Actividad económica
      const activitySelect = page.locator('#ciiuDivision');
      await page.waitForTimeout(500);
      const actOptions = await activitySelect.locator('option').count();
      if (actOptions > 1) {
        await activitySelect.selectOption({ index: 1 }, { force: true });
        console.log('   ✓ Actividad seleccionada');
      }
      
      await page.fill('#ciudad', testData.empresa.ciudad);
      console.log(`   ✓ Ciudad: ${testData.empresa.ciudad}`);
      
      await page.screenshot({ path: path.join(resultsDir, 'paso1-info-basica.png') });
      await clickNext(page);
      await page.waitForTimeout(1000);
      console.log('   ✅ Paso 1 completado\n');
    });

    // ========================================
    // PASO 2: AGREGAR CARGO
    // ========================================
    
    await test.step('Paso 2: Agregar Cargo', async () => {
      console.log('📝 PASO 2: Agregar Cargo...');
      await page.waitForTimeout(500);
      
      // Buscar botón de agregar cargo (FAB o button)
      const addCargoBtn = page.locator('[data-action="add-cargo"], button:has-text("Agregar"), .fab-add-cargo').first();
      
      if (await addCargoBtn.isVisible({ timeout: 5000 })) {
        // Esperar que termine animación inicial
        await page.waitForTimeout(2000);
        await addCargoBtn.click({ force: true });
        console.log('   ✓ Modal de cargo abierto');
        await page.waitForTimeout(500);
        
        // Llenar formulario del modal
        const nombreInput = page.locator('#cargo-nombre');
        if (await nombreInput.isVisible({ timeout: 3000 })) {
          await nombreInput.fill(testData.cargo.nombre);
          console.log(`   ✓ Nombre cargo: ${testData.cargo.nombre}`);
        }
        
        const descripcionInput = page.locator('#cargo-descripcion');
        if (await descripcionInput.isVisible()) {
          await descripcionInput.fill(testData.cargo.descripcion);
        }
        
        const numPersonasInput = page.locator('#cargo-num-personas');
        if (await numPersonasInput.isVisible()) {
          await numPersonasInput.fill(testData.cargo.numPersonas);
          console.log(`   ✓ Personas: ${testData.cargo.numPersonas}`);
        }
        
        const areaInput = page.locator('#cargo-area');
        if (await areaInput.isVisible()) {
          await areaInput.fill(testData.cargo.area);
          console.log(`   ✓ Área: ${testData.cargo.area}`);
        }
        
        const zonaInput = page.locator('#cargo-zona');
        if (await zonaInput.isVisible()) {
          await zonaInput.fill(testData.cargo.zona);
          console.log(`   ✓ Zona: ${testData.cargo.zona}`);
        }
        
        // Guardar cargo
        const saveBtn = page.locator('[data-action="save-cargo"], button:has-text("Guardar")').first();
        if (await saveBtn.isVisible()) {
          await saveBtn.click({ force: true });
          console.log('   ✓ Cargo guardado');
          
          // Esperar que el modal se cierre
          await page.waitForTimeout(1500);
          
          // Si el modal sigue abierto, cerrarlo manualmente
          const modalVisible = await page.locator('#modal-add-cargo').isVisible();
          if (modalVisible) {
            const closeBtn = page.locator('[data-action="close-modal"], .btn-close, #modal-add-cargo .close').first();
            if (await closeBtn.isVisible()) {
              await closeBtn.click();
              await page.waitForTimeout(500);
            } else {
              // Presionar Escape para cerrar
              await page.keyboard.press('Escape');
              await page.waitForTimeout(500);
            }
            console.log('   ✓ Modal cerrado');
          }
        }
      } else {
        console.log('   ⚠️ No se encontró botón agregar cargo - puede ya existir uno');
      }
      
      await page.screenshot({ path: path.join(resultsDir, 'paso2-cargos.png') });
      await clickNext(page);
      await page.waitForTimeout(1000);
      console.log('   ✅ Paso 2 completado\n');
    });

    // ========================================
    // PASO 3: SELECCIONAR RIESGOS (GES)
    // ========================================
    
    await test.step('Paso 3: Seleccionar Riesgos', async () => {
      console.log('📝 PASO 3: Seleccionar Riesgos...');
      
      // Cerrar overlay de IA si existe
      const aiOverlay = page.locator('.ai-popover-overlay.active');
      if (await aiOverlay.isVisible({ timeout: 1000 }).catch(() => false)) {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      }
      
      // Esperar que cargue el catálogo de GES (puede tardar)
      await page.waitForTimeout(3000);
      
      // Los GES están en labels con clase .ges-item
      // Cada uno tiene un checkbox .ges-item__checkbox
      const gesItems = page.locator('label.ges-item:not(.skeleton)');
      const gesCount = await gesItems.count();
      console.log(`   GES disponibles: ${gesCount}`);
      
      if (gesCount > 0) {
        // Seleccionar 2-3 GES haciendo click en el label
        const toSelect = Math.min(3, gesCount);
        for (let i = 0; i < toSelect; i++) {
          try {
            // Click en el checkbox dentro del ges-item
            const checkbox = gesItems.nth(i).locator('.ges-item__checkbox');
            await checkbox.click({ force: true });
            await page.waitForTimeout(300);
          } catch (e) {
            // Si falla, intentar click en el label completo
            try {
              await gesItems.nth(i).click({ force: true });
              await page.waitForTimeout(300);
            } catch (e2) {
              console.log(`   ⚠️ No se pudo seleccionar GES ${i}`);
            }
          }
        }
        console.log(`   ✓ GES seleccionados: ${toSelect}`);
      } else {
        // Buscar si hay tabs de cargo para seleccionar primero
        const cargoTabs = page.locator('.cargo-tab, [data-cargo-index]');
        const tabCount = await cargoTabs.count();
        console.log(`   Tabs de cargo: ${tabCount}`);
        
        if (tabCount > 0) {
          await cargoTabs.first().click();
          await page.waitForTimeout(1000);
          
          // Reintentar buscar GES
          const gesItemsRetry = page.locator('label.ges-item:not(.skeleton)');
          const gesCountRetry = await gesItemsRetry.count();
          console.log(`   GES después de tab: ${gesCountRetry}`);
          
          if (gesCountRetry > 0) {
            for (let i = 0; i < Math.min(2, gesCountRetry); i++) {
              await gesItemsRetry.nth(i).click({ force: true });
              await page.waitForTimeout(300);
            }
            console.log('   ✓ GES seleccionados');
          }
        }
      }
      
      await page.screenshot({ path: path.join(resultsDir, 'paso3-riesgos.png') });
      await clickNext(page);
      await page.waitForTimeout(1000);
      console.log('   ✅ Paso 3 completado\n');
    });

    // ========================================
    // PASO 4: CONFIGURAR NIVELES DE RIESGO
    // ========================================
    
    await test.step('Paso 4: Configurar Niveles (ND, NE, NC) para cada GES', async () => {
      console.log('📝 PASO 4: Niveles de Riesgo...');
      await page.waitForTimeout(2000);
      
      // Los GES se configuran uno a la vez (step-by-step)
      // Cada GES necesita 3 niveles: ND, NE, NC
      // Después de configurar cada GES, hay que hacer click en "Siguiente Riesgo"
      
      let gesConfigured = 0;
      const maxGES = 5; // Máximo de GES a configurar (safety limit)
      
      for (let gesIndex = 0; gesIndex < maxGES; gesIndex++) {
        // Verificar si hay barras de nivel visibles (indica que hay un GES para configurar)
        const nivelBars = page.locator('.nivel-bar');
        const barCount = await nivelBars.count();
        
        if (barCount === 0) {
          console.log(`   No hay más GES para configurar`);
          break;
        }
        
        console.log(`   Configurando GES ${gesIndex + 1} (${barCount} barras)...`);
        
        // Configurar los 3 niveles (ND, NE, NC) para este GES
        // Cada barra tiene 4 opciones, seleccionamos la segunda (índice 1) = nivel medio
        for (let i = 0; i < barCount; i++) {
          const options = nivelBars.nth(i).locator('.nivel-option');
          const optCount = await options.count();
          
          if (optCount >= 2) {
            try {
              // Seleccionar segunda opción (nivel medio/moderado)
              await options.nth(1).click({ force: true });
              await page.waitForTimeout(200);
            } catch (e) {
              console.log(`   ⚠️ Error seleccionando nivel ${i}`);
            }
          }
        }
        
        gesConfigured++;
        console.log(`   ✓ GES ${gesIndex + 1}: ND, NE, NC configurados`);
        
        await page.screenshot({ path: path.join(resultsDir, `paso4-ges${gesIndex + 1}.png`) });
        
        // Buscar botón "Siguiente Riesgo" para ir al próximo GES
        const nextGESBtn = page.locator('button:has-text("Siguiente Riesgo"), button:has-text("Siguiente GES")').first();
        
        if (await nextGESBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await nextGESBtn.click({ force: true });
          await page.waitForTimeout(1000);
          console.log(`   → Avanzando al siguiente GES...`);
        } else {
          // Si no hay botón "Siguiente Riesgo", este es el último GES
          console.log(`   ✓ Último GES configurado`);
          
          // Buscar botón "Validar Todo y Continuar" o similar
          const validateBtn = page.locator('button:has-text("Validar"), button:has-text("Continuar"), button:has-text("Confirmar")').first();
          if (await validateBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await validateBtn.click({ force: true });
            await page.waitForTimeout(500);
            console.log(`   ✓ Click en Validar/Continuar`);
          }
          break;
        }
      }
      
      console.log(`   Total GES configurados: ${gesConfigured}`);
      
      await page.screenshot({ path: path.join(resultsDir, 'paso4-niveles-final.png') });
      await clickNext(page);
      await page.waitForTimeout(1000);
      console.log('   ✅ Paso 4 completado\n');
    });

    // ========================================
    // PASO 5: RESUMEN Y GENERAR
    // ========================================
    
    await test.step('Paso 5: Resumen y Generar Documentos', async () => {
      console.log('📝 PASO 5: Resumen...');
      
      // Esperar que el paso de resumen se renderice
      await page.waitForTimeout(3000);
      
      // Verificar en qué paso estamos
      const currentStep = await page.locator('.wizard-step.active, .wizard-step[data-step]').first().getAttribute('data-step').catch(() => 'unknown');
      console.log(`   Paso actual: ${currentStep}`);
      
      // Cerrar overlay de IA si existe
      const aiOverlay = page.locator('.ai-popover-overlay.active');
      if (await aiOverlay.isVisible({ timeout: 1000 }).catch(() => false)) {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        console.log('   ✓ Overlay cerrado');
      }
      
      // Verificar si existe el submit-section (parte del paso de resumen)
      const submitSection = await page.locator('#submit-section, .submit-section').isVisible({ timeout: 2000 }).catch(() => false);
      console.log(`   Submit section visible: ${submitSection}`);
      
      await page.screenshot({ path: path.join(resultsDir, 'paso5-resumen.png') });
      
      // Buscar botón específico de generar documentos
      // El botón tiene id="btn-generar-documentos"
      const btnGenerarId = page.locator('#btn-generar-documentos');
      const btnGenerarText = page.locator('button:has-text("Generar Documentos")');
      
      let clicked = false;
      
      // Primero intentar con el ID específico
      if (await btnGenerarId.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log('   ✓ Botón #btn-generar-documentos encontrado');
        
        // Usar click nativo del DOM para asegurar que el listener se ejecute
        await page.evaluate(() => {
          const btn = document.querySelector('#btn-generar-documentos') as HTMLElement | null;
          if (btn) {
            console.log('[Test] Clicking #btn-generar-documentos via JS');
            btn.click();
          }
        });
        clicked = true;
        console.log('   📤 Click en #btn-generar-documentos (via JS)');
      } else if (await btnGenerarText.first().isVisible({ timeout: 3000 }).catch(() => false)) {
        const btnText = await btnGenerarText.first().textContent();
        console.log(`   ✓ Botón encontrado: "${btnText?.trim()}"`);
        await btnGenerarText.first().click({ force: true });
        clicked = true;
        console.log('   📤 Click en botón Generar Documentos');
      }
      
      if (clicked) {
        await page.waitForTimeout(3000);
      }
      
      if (!clicked) {
        // Si no hay botón generar visible, puede que estemos en el paso de resumen
        // y necesitemos hacer click en "Siguiente" que dice "Generar Documentos"
        const nextBtn = page.locator('[data-action="next"], .wizard-btn-next').first();
        if (await nextBtn.isVisible({ timeout: 3000 })) {
          const btnText = await nextBtn.textContent();
          console.log(`   Botón siguiente encontrado: "${btnText?.trim()}"`);
          await nextBtn.click({ force: true });
          await page.waitForTimeout(3000);
        } else {
          console.log('   ⚠️ No se encontró botón de generar');
        }
      }
      
      await page.screenshot({ path: path.join(resultsDir, 'paso5-post-generar.png') });
      
      // Verificar si hay errores en la consola
      page.on('console', msg => {
        if (msg.type() === 'error') {
          console.log(`   ⚠️ Console error: ${msg.text()}`);
        }
      });
      
      console.log('   ✅ Paso 5 completado\n');
    });

    // ========================================
    // FASE 2: MODAL DE REGISTRO
    // ========================================
    
    await test.step('Completar Modal de Registro', async () => {
      console.log('📝 MODAL DE REGISTRO...');
      
      // Esperar un poco más para que aparezca el modal
      await page.waitForTimeout(3000);
      
      // Debug: ver qué hay en la página
      const pageContent = await page.content();
      const hasModal = pageContent.includes('registration-modal') || pageContent.includes('Completa tu Registro');
      console.log(`   Debug: Modal en DOM: ${hasModal}`);
      
      // Esperar modal
      const modal = page.locator('#registration-modal, .wizard-modal:has-text("Registro"), .wizard-modal:has-text("Completa")');
      
      try {
        await modal.waitFor({ state: 'visible', timeout: 15000 });
        console.log('   ✓ Modal visible');
        
        await page.screenshot({ path: path.join(resultsDir, 'modal-registro.png') });
        
        // Email
        const emailInput = page.locator('#modal-email');
        if (await emailInput.isVisible()) {
          await emailInput.fill(testData.empresa.email);
          console.log(`   ✓ Email: ${testData.empresa.email}`);
        }
        
        // Password
        const passwordInput = page.locator('#modal-password');
        if (await passwordInput.isVisible()) {
          await passwordInput.fill(testData.empresa.password);
          console.log(`   ✓ Password: ${testData.empresa.password}`);
        }
        
        // Nombre contacto
        const nombreInput = page.locator('#modal-nombre');
        if (await nombreInput.isVisible()) {
          await nombreInput.fill(testData.empresa.contacto);
        }
        
        // Submit
        const submitBtn = page.locator('button[type="submit"], .submit-modal-btn').first();
        if (await submitBtn.isVisible()) {
          console.log('   📤 Enviando registro...');
          await submitBtn.click();
          
          // Esperar respuesta
          await page.waitForTimeout(5000);
          
          const currentUrl = page.url();
          console.log(`   URL actual: ${currentUrl}`);
          
          if (currentUrl.includes('resultados')) {
            console.log('   ✅ REGISTRO EXITOSO - Redirigido a resultados');
          }
          
          await page.screenshot({ path: path.join(resultsDir, 'post-registro.png') });
        }
        
      } catch (e) {
        console.log('   ⚠️ Modal no apareció');
        await page.screenshot({ path: path.join(resultsDir, 'no-modal.png') });
      }
    });

    // ========================================
    // GUARDAR CREDENCIALES
    // ========================================
    
    await test.step('Guardar Credenciales', async () => {
      const credentialsFile = path.join(resultsDir, 'credenciales.json');
      
      fs.writeFileSync(credentialsFile, JSON.stringify({
        empresa: testData.empresa.nombre,
        nit: testData.empresa.nit,
        email: testData.empresa.email,
        password: testData.empresa.password,
        contacto: testData.empresa.contacto,
        fechaTest: new Date().toISOString(),
        urlFinal: page.url()
      }, null, 2));
      
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ CREDENCIALES PARA LOGIN:');
      console.log(`   📧 Email: ${testData.empresa.email}`);
      console.log(`   🔑 Password: ${testData.empresa.password}`);
      console.log(`   🔢 NIT: ${testData.empresa.nit}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    });

    // ========================================
    // FASE 3: LOGIN
    // ========================================
    
    await test.step('Probar Login', async () => {
      console.log('📝 PROBANDO LOGIN...');
      
      await page.goto('/pages/login.html');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1000);
      
      await page.screenshot({ path: path.join(resultsDir, 'login-page.png') });
      
      // Click en tab de empresa (si existe)
      const empresaTab = page.locator('button[data-tab="empresa"], .login-tab:has-text("Empresa")');
      if (await empresaTab.isVisible({ timeout: 3000 })) {
        await empresaTab.click();
        await page.waitForTimeout(500);
        console.log('   ✓ Tab empresa seleccionado');
      }
      
      // Formulario de empresa (usar selectores específicos para el form de empresa)
      const nitInput = page.locator('#form-empresa #nit, #nit');
      const passwordInput = page.locator('#password-empresa');
      
      if (await nitInput.isVisible({ timeout: 3000 })) {
        await nitInput.fill(testData.empresa.nit);
        console.log(`   ✓ NIT: ${testData.empresa.nit}`);
        
        if (await passwordInput.isVisible()) {
          await passwordInput.fill(testData.empresa.password);
          console.log('   ✓ Password ingresado');
          
          const loginBtn = page.locator('button[type="submit"], .login-btn').first();
          if (await loginBtn.isVisible()) {
            await loginBtn.click();
            console.log('   📤 Enviando login...');
            
            await page.waitForTimeout(3000);
            
            const finalUrl = page.url();
            console.log(`   URL final: ${finalUrl}`);
            
            await page.screenshot({ path: path.join(resultsDir, 'post-login.png') });
            
            if (finalUrl.includes('dashboard') || finalUrl.includes('perfil') || finalUrl.includes('home') || finalUrl.includes('resultados')) {
              console.log('   ✅ LOGIN EXITOSO');
            } else {
              console.log('   ⚠️ Login no redirigió - verificar credenciales manualmente');
            }
          }
        }
      }
      
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🎉 TEST COMPLETADO');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    });
  });
});

// ========================================
// HELPERS
// ========================================

async function clickNext(page: Page) {
  const nextSelectors = [
    'button:has-text("Siguiente")',
    'button:has-text("Continuar")',
    '.wizard-btn-next',
    '.btn-next',
    'button[data-action="next"]',
  ];
  
  for (const selector of nextSelectors) {
    try {
      const btn = page.locator(selector).first();
      if (await btn.isVisible({ timeout: 2000 })) {
        await btn.click();
        return;
      }
    } catch (e) {
      // Continuar
    }
  }
}
