import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración de Playwright para Genesys Laboral Medicine
 * Tests E2E del Wizard de Diagnóstico
 */
export default defineConfig({
  testDir: './tests',
  
  // Tiempo máximo por test (5 minutos para el wizard completo)
  timeout: 5 * 60 * 1000,
  
  // Reintentos en caso de fallo
  retries: 1,
  
  // Reportes
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  
  // Configuración global
  use: {
    // URL base del frontend
    baseURL: process.env.BASE_URL || 'http://localhost:8080',
    
    // Screenshots en caso de fallo
    screenshot: 'only-on-failure',
    
    // Video de los tests
    video: 'retain-on-failure',
    
    // Traza para debugging
    trace: 'retain-on-failure',
    
    // Viewport
    viewport: { width: 1280, height: 720 },
    
    // Timeout para acciones
    actionTimeout: 15000,
    
    // Timeout para navegación
    navigationTimeout: 30000,
  },

  // Proyectos de test
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Descomentar para probar en más navegadores
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Servidor de desarrollo (opcional - si no está corriendo)
  // webServer: {
  //   command: 'cd ../../client && npm run dev',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120 * 1000,
  // },
});
