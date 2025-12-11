# 🎭 Tests E2E - Genesys Laboral Medicine

Tests automatizados con Playwright para el Wizard de Diagnóstico SST.

## 🚀 Inicio Rápido

```bash
cd tests/e2e

# Instalar dependencias (si no están)
npm install

# Correr todos los tests
npm test

# Correr con navegador visible (para ver qué hace)
npm run test:headed

# Correr solo el wizard
npm run test:wizard
```

## 📹 Ver Tests en Tiempo Real (Recomendado)

```bash
# Modo UI interactivo - ¡Ve los tests mientras corren!
npm run test:ui
```

## 🎬 Grabar Tests Nuevos

Playwright puede **grabar tus acciones** y generar código automáticamente:

```bash
# Abre el navegador y graba lo que haces
npm run codegen

# O directamente al wizard
npx playwright codegen http://localhost:3000/wizard.html
```

Esto abre un navegador donde tú interactúas manualmente y Playwright genera el código del test.

## 📊 Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm test` | Correr todos los tests (headless) |
| `npm run test:headed` | Tests con navegador visible |
| `npm run test:ui` | **UI interactiva** - ver tests en tiempo real |
| `npm run test:debug` | Modo debug paso a paso |
| `npm run test:wizard` | Solo tests del wizard, con navegador |
| `npm run codegen` | Grabar nuevos tests |
| `npm run report` | Ver reporte HTML de resultados |

## 📁 Estructura

```
tests/e2e/
├── playwright.config.ts    # Configuración
├── helpers/
│   └── fake-data.ts        # Generador de datos fake (empresas, NITs, etc.)
├── tests/
│   └── wizard.spec.ts      # Tests del wizard
├── test-results/           # Screenshots y videos (generados)
│   └── credentials/        # 📋 Credenciales de tests para verificar
└── README.md
```

## 🔑 Credenciales Generadas

Después de cada test, las credenciales se guardan en:

```
tests/e2e/test-results/credentials/empresa-{fecha}.json
```

Ejemplo:
```json
{
  "email": "construcciones@empresa.com.co",
  "password": "abc123xyz",
  "nit": "900123456-7",
  "nombreEmpresa": "Construcciones del Valle S.A.S",
  "fechaCreacion": "2025-12-07T10:30:00.000Z"
}
```

**Usa estas credenciales para entrar al dashboard y verificar manualmente**.

## ⚙️ Configuración

### Cambiar URL Base

Edita `playwright.config.ts`:

```typescript
use: {
  baseURL: 'http://tu-servidor:puerto',
}
```

O usa variable de entorno:

```bash
BASE_URL=http://localhost:8080 npm test
```

### Ejecutar más lento (para ver)

```bash
# Con pausa entre acciones
npx playwright test --headed --slow-mo 500

# O modo debug
npm run test:debug
```

## 🐛 Troubleshooting

### Error: "net::ERR_CONNECTION_REFUSED"

El servidor del frontend no está corriendo:

```bash
# En otra terminal, inicia el frontend
cd ../../client
npm run dev
```

### Error: "Element not found"

Los selectores pueden no coincidir con tu UI actual. Usa el **codegen** para obtener los selectores correctos:

```bash
npm run codegen
```

### Tests muy lentos

Reduce el timeout en `playwright.config.ts`:

```typescript
timeout: 60 * 1000, // 1 minuto
```

## 🎯 Próximos Tests

- [ ] Test de login
- [ ] Test de dashboard
- [ ] Test de generación de profesiogramas
- [ ] Tests de validación de campos
- [ ] Tests de casos de error

---

**Creado por:** Claude (Automatización de Tests)  
**Fecha:** 2025-12-07

