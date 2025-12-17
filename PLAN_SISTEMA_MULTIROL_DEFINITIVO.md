# Plan Definitivo: Sistema de Gestión SST Multi-Perfil
# Plan Definitivo: Sistema de Gestión SST Multi-Perfil

**Versión:** 2.0 (Auditado)
**Fecha:** 12 de Diciembre, 2025
**Auditado por:** Agentes Especializados (Database, Backend, UX/UI, Architecture)
**Estado:** APROBADO PARA IMPLEMENTACIÓN

---

## Resumen Ejecutivo

Este plan define la implementación de dos nuevos dashboards para roles adicionales:
1. **Administrador Genesys** - Usuario interno que gestiona toda la plataforma
2. **Médico Ocupacional** - Profesional SST que gestiona múltiples empresas asignadas

### Principios de Diseño
- **Consistencia**: Reutilizar 85%+ de componentes existentes del dashboard cliente
- **Accesibilidad**: WCAG 2.1 AA compliance
- **Arquitectura**: Extender patrones existentes, no reinventar

---

## FASE 1: INFRAESTRUCTURA DE BASE DE DATOS

### 1.1 Migración: Extender Tabla Roles

**Archivo:** `server/src/database/migrations/20251212000001_enhance_roles_system.cjs`

```javascript
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
        // Modificar tabla roles existente
        .alterTable('roles', (table) => {
            table.text('descripcion');
            table.jsonb('permisos').defaultTo('{}');
            table.boolean('activo').defaultTo(true);
            table.timestamps(true, true);
        })
        .then(() => {
            // Insertar nuevo rol médico
            return knex('roles').insert([
                {
                    nombre: 'medico_ocupacional',
                    descripcion: 'Médico especialista en SST asignado a empresas',
                    permisos: JSON.stringify({
                        empresas_asignadas: true,
                        profesiograma: 'full',
                        examenes_cargo: true,
                        firma_digital: true,
                        aprobar_profesiogramas: true,
                        configuracion: 'own'
                    }),
                    activo: true
                }
            ]);
        })
        .then(() => {
            // Actualizar roles existentes con permisos
            return knex('roles')
                .where('nombre', 'admin_genesys')
                .update({
                    descripcion: 'Administrador interno de Genesys',
                    permisos: JSON.stringify({
                        gestion_pagos: true,
                        asignar_medicos: true,
                        cargar_condiciones_salud: true,
                        gestion_empresas: true,
                        auditoria: true,
                        configuracion: 'all',
                        ver_todas_empresas: true
                    })
                });
        })
        .then(() => {
            return knex('roles')
                .where('nombre', 'cliente_empresa')
                .update({
                    descripcion: 'Usuario de empresa cliente de Genesys',
                    permisos: JSON.stringify({
                        dashboard: true,
                        mapa_org: true,
                        cargos: true,
                        matriz_gtc45: true,
                        profesiograma: 'readonly',
                        examenes: true,
                        inteligencia_salud: true,
                        estadisticas: true,
                        sve: true,
                        documentos: true,
                        configuracion: 'own'
                    })
                });
        });
};

exports.down = function(knex) {
    return knex('roles')
        .where('nombre', 'medico_ocupacional')
        .del()
        .then(() => {
            return knex.schema.alterTable('roles', (table) => {
                table.dropColumn('descripcion');
                table.dropColumn('permisos');
                table.dropColumn('activo');
                table.dropColumn('created_at');
                table.dropColumn('updated_at');
            });
        });
};
```

### 1.2 Migración: Campos de Médico en Users

**Archivo:** `server/src/database/migrations/20251212000002_add_medico_fields_users.cjs`

```javascript
exports.up = function(knex) {
    return knex.schema.alterTable('users', (table) => {
        // Campos específicos para médicos
        table.string('licencia_sst', 50).comment('Número de licencia SST');
        table.date('fecha_vencimiento_licencia');
        table.string('especialidad', 100);

        // Firma digital PNG
        table.text('firma_url').comment('URL de firma en DigitalOcean Spaces');
        table.jsonb('firma_metadatos').defaultTo('{}').comment('width, height, hash, updated_at');

        // Índices
        table.index('licencia_sst');
    });
};

exports.down = function(knex) {
    return knex.schema.alterTable('users', (table) => {
        table.dropColumn('licencia_sst');
        table.dropColumn('fecha_vencimiento_licencia');
        table.dropColumn('especialidad');
        table.dropColumn('firma_url');
        table.dropColumn('firma_metadatos');
    });
};
```

### 1.3 Migración: Relación N:N Médicos-Empresas

**Archivo:** `server/src/database/migrations/20251212000003_create_medicos_empresas.cjs`

```javascript
exports.up = function(knex) {
    return knex.schema.createTable('medicos_empresas', (table) => {
        table.increments('id').primary();

        // Relaciones
        table.integer('medico_id').unsigned().notNullable()
            .references('id').inTable('users').onDelete('CASCADE');
        table.integer('empresa_id').unsigned().notNullable()
            .references('id').inTable('empresas').onDelete('CASCADE');
        table.integer('asignado_por').unsigned()
            .references('id').inTable('users');

        // Metadata
        table.timestamp('fecha_asignacion').defaultTo(knex.fn.now());
        table.timestamp('fecha_fin');
        table.boolean('activo').defaultTo(true);
        table.boolean('es_medico_principal').defaultTo(false);
        table.text('notas');

        // Timestamps
        table.timestamps(true, true);

        // Constraints
        table.unique(['medico_id', 'empresa_id']);

        // Índices para queries frecuentes
        table.index('medico_id');
        table.index('empresa_id');
        table.index(['empresa_id', 'activo']);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('medicos_empresas');
};
```

### 1.4 Migración: Tabla de Pagos Manuales

**Archivo:** `server/src/database/migrations/20251212000004_create_pagos_manuales.cjs`

```javascript
exports.up = function(knex) {
    return knex.schema.createTable('pagos_manuales', (table) => {
        table.increments('id').primary();

        // Relaciones
        table.integer('empresa_id').unsigned().notNullable()
            .references('id').inTable('empresas').onDelete('CASCADE');
        table.integer('registrado_por').unsigned()
            .references('id').inTable('users');
        table.integer('aprobado_por').unsigned()
            .references('id').inTable('users');

        // Datos del pago
        table.decimal('monto', 12, 2).notNullable();
        table.string('referencia_pago', 100);
        table.enum('metodo_pago', ['transferencia', 'qr', 'efectivo', 'otro']).notNullable();
        table.enum('estado', ['pendiente', 'aprobado', 'rechazado']).defaultTo('pendiente');

        // Evidencia
        table.text('evidencia_url');
        table.string('evidencia_tipo', 50);

        // Fechas
        table.timestamp('fecha_pago');
        table.timestamp('fecha_aprobacion');
        table.timestamp('fecha_rechazo');

        // Notas
        table.text('notas');
        table.text('motivo_rechazo');

        // Timestamps
        table.timestamps(true, true);

        // Índices
        table.index('empresa_id');
        table.index('estado');
        table.index('created_at');
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('pagos_manuales');
};
```

### 1.5 Migración: Extender Tabla Empresas

**Archivo:** `server/src/database/migrations/20251212000005_enhance_empresas.cjs`

```javascript
exports.up = function(knex) {
    return knex.schema.alterTable('empresas', (table) => {
        // Estado de servicio
        table.enum('status', ['activa', 'suspendida', 'pendiente_pago']).defaultTo('activa');
        table.timestamp('fecha_suspension');
        table.text('razon_suspension');

        // Datos adicionales
        table.string('email', 255);
        table.string('telefono', 50);
        table.string('ciudad', 100);
        table.string('direccion', 255);
        table.string('ciiu', 20);
        table.string('sector_economico', 100);

        // Responsable SST
        table.string('responsable_sst_nombre', 255);
        table.string('responsable_sst_cargo', 100);
        table.string('responsable_sst_telefono', 50);
        table.string('responsable_sst_email', 255);

        // Servicios contratados
        table.boolean('servicio_matriz_riesgos').defaultTo(true);
        table.boolean('servicio_profesiograma').defaultTo(true);
        table.boolean('servicio_sve').defaultTo(false);

        // Último pago
        table.timestamp('ultimo_pago');

        // Índices
        table.index('status');
        table.index('ciiu');
    });
};

exports.down = function(knex) {
    return knex.schema.alterTable('empresas', (table) => {
        table.dropColumn('status');
        table.dropColumn('fecha_suspension');
        table.dropColumn('razon_suspension');
        table.dropColumn('email');
        table.dropColumn('telefono');
        table.dropColumn('ciudad');
        table.dropColumn('direccion');
        table.dropColumn('ciiu');
        table.dropColumn('sector_economico');
        table.dropColumn('responsable_sst_nombre');
        table.dropColumn('responsable_sst_cargo');
        table.dropColumn('responsable_sst_telefono');
        table.dropColumn('responsable_sst_email');
        table.dropColumn('servicio_matriz_riesgos');
        table.dropColumn('servicio_profesiograma');
        table.dropColumn('servicio_sve');
        table.dropColumn('ultimo_pago');
    });
};
```

### 1.6 Migración: Tabla de Auditoría

**Archivo:** `server/src/database/migrations/20251212000006_create_auditoria.cjs`

```javascript
exports.up = function(knex) {
    return knex.schema.createTable('auditoria', (table) => {
        table.increments('id').primary();

        // Usuario que realizó la acción
        table.integer('user_id').unsigned()
            .references('id').inTable('users').onDelete('SET NULL');

        // Acción realizada
        table.string('accion', 100).notNullable();
        table.string('recurso', 100).notNullable(); // 'pagos', 'empresas', 'medicos', etc
        table.integer('recurso_id');

        // Detalles
        table.jsonb('detalles').defaultTo('{}');
        table.jsonb('valores_anteriores');
        table.jsonb('valores_nuevos');

        // Metadata
        table.string('ip_address', 45);
        table.text('user_agent');

        // Timestamp
        table.timestamp('created_at').defaultTo(knex.fn.now());

        // Índices para búsquedas frecuentes
        table.index('user_id');
        table.index('accion');
        table.index('recurso');
        table.index('created_at');
        table.index(['recurso', 'recurso_id']);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('auditoria');
};
```

---

## FASE 2: BACKEND - CONTROLADORES Y RUTAS

### 2.1 Estructura de Archivos

```
server/src/
├── controllers/
│   ├── admin/
│   │   ├── pagos.controller.js      # Gestión de pagos manuales
│   │   ├── medicos.controller.js    # Asignación médicos-empresas
│   │   ├── empresas.controller.js   # Gestión de empresas
│   │   └── auditoria.controller.js  # Logs del sistema
│   └── medico/
│       ├── empresas.controller.js   # Mis empresas asignadas
│       ├── profesiograma.controller.js # Editor de profesiograma
│       └── firma.controller.js      # Upload/gestión firma PNG
├── routes/
│   ├── admin.routes.js              # /api/admin/*
│   └── medico.routes.js             # /api/medico/*
├── middleware/
│   ├── authenticate.js              # (existente - extender)
│   ├── validateBody.js              # Validación con Joi
│   └── fileValidation.js            # Validación de uploads
└── services/
    └── auditoria.service.js         # Servicio de logging
```

### 2.2 Middleware: Acceso de Médico a Empresa

**Archivo:** `server/src/middleware/authenticate.js` (AGREGAR)

```javascript
/**
 * Middleware para verificar que un médico tiene acceso a una empresa
 * Debe usarse DESPUÉS de authenticate
 *
 * @param {string} paramName - Nombre del parámetro con empresa_id (default: 'empresaId')
 */
export function requireMedicoAccess(paramName = 'empresaId') {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Autenticación requerida',
                code: 'NOT_AUTHENTICATED'
            });
        }

        // Admins tienen acceso total
        if (req.user.rol === 'admin_genesys') {
            return next();
        }

        // Solo médicos pueden usar este middleware
        if (req.user.rol !== 'medico_ocupacional') {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado. Solo médicos ocupacionales.',
                code: 'NOT_MEDICO'
            });
        }

        const empresaId = parseInt(
            req.params[paramName] ||
            req.body[paramName] ||
            req.query[paramName]
        );

        if (!empresaId) {
            return res.status(400).json({
                success: false,
                message: 'ID de empresa requerido',
                code: 'MISSING_EMPRESA_ID'
            });
        }

        try {
            // Verificar asignación en BD
            const asignacion = await knex('medicos_empresas')
                .where({
                    medico_id: req.user.id,
                    empresa_id: empresaId,
                    activo: true
                })
                .first();

            if (!asignacion) {
                return res.status(403).json({
                    success: false,
                    message: 'No tiene acceso a esta empresa',
                    code: 'NO_ACCESS_EMPRESA'
                });
            }

            // Añadir info de asignación a request
            req.asignacionMedico = asignacion;
            req.empresaId = empresaId;

            next();
        } catch (error) {
            console.error('Error verificando acceso médico:', error);
            return res.status(500).json({
                success: false,
                message: 'Error verificando permisos',
                code: 'ACCESS_CHECK_ERROR'
            });
        }
    };
}
```

### 2.3 Rutas Admin

**Archivo:** `server/src/routes/admin.routes.js`

```javascript
import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authenticate.js';
import * as pagosController from '../controllers/admin/pagos.controller.js';
import * as medicosController from '../controllers/admin/medicos.controller.js';
import * as empresasController from '../controllers/admin/empresas.controller.js';
import * as auditoriaController from '../controllers/admin/auditoria.controller.js';
import multer from 'multer';

const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Middleware: Solo admin_genesys
router.use(authenticate, requireRole('admin_genesys'));

// === PAGOS ===
router.get('/pagos', pagosController.listar);
router.get('/pagos/:id', pagosController.obtener);
router.post('/pagos', upload.single('evidencia'), pagosController.registrar);
router.post('/pagos/:id/aprobar', pagosController.aprobar);
router.post('/pagos/:id/rechazar', pagosController.rechazar);
router.get('/pagos/estadisticas', pagosController.estadisticas);

// === MÉDICOS ===
router.get('/medicos', medicosController.listar);
router.get('/medicos/:id', medicosController.obtener);
router.post('/medicos', medicosController.crear);
router.put('/medicos/:id', medicosController.actualizar);
router.get('/medicos/:id/empresas', medicosController.empresasAsignadas);
router.post('/medicos/:medicoId/asignar/:empresaId', medicosController.asignarEmpresa);
router.delete('/medicos/:medicoId/desasignar/:empresaId', medicosController.desasignarEmpresa);

// === EMPRESAS ===
router.get('/empresas', empresasController.listar);
router.get('/empresas/:id', empresasController.obtener);
router.put('/empresas/:id', empresasController.actualizar);
router.post('/empresas/:id/suspender', empresasController.suspender);
router.post('/empresas/:id/activar', empresasController.activar);
router.get('/empresas/:id/medicos', empresasController.medicosAsignados);

// === AUDITORÍA ===
router.get('/auditoria', auditoriaController.listar);
router.get('/auditoria/exportar', auditoriaController.exportar);

export default router;
```

### 2.4 Rutas Médico

**Archivo:** `server/src/routes/medico.routes.js`

```javascript
import { Router } from 'express';
import { authenticate, requireRole, requireMedicoAccess } from '../middleware/authenticate.js';
import * as empresasController from '../controllers/medico/empresas.controller.js';
import * as profesiogramaController from '../controllers/medico/profesiograma.controller.js';
import * as firmaController from '../controllers/medico/firma.controller.js';
import multer from 'multer';

const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 500 * 1024 }, // 500KB para firma
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'image/png') {
            cb(new Error('Solo se permiten archivos PNG'));
        } else {
            cb(null, true);
        }
    }
});

// Middleware: Solo medico_ocupacional (o admin)
router.use(authenticate, requireRole('medico_ocupacional', 'admin_genesys'));

// === MIS EMPRESAS ===
router.get('/empresas', empresasController.misEmpresas);
router.get('/empresas/:empresaId', requireMedicoAccess(), empresasController.detalleEmpresa);
router.get('/empresas/:empresaId/cargos', requireMedicoAccess(), empresasController.cargosPorEmpresa);

// === PROFESIOGRAMA ===
router.get('/empresas/:empresaId/profesiograma', requireMedicoAccess(), profesiogramaController.obtener);
router.put('/empresas/:empresaId/profesiograma', requireMedicoAccess(), profesiogramaController.actualizar);
router.post('/empresas/:empresaId/profesiograma/regenerar', requireMedicoAccess(), profesiogramaController.regenerarPDF);

// === FIRMA DIGITAL ===
router.get('/firma', firmaController.obtener);
router.post('/firma', upload.single('firma'), firmaController.subir);
router.delete('/firma', firmaController.eliminar);
router.get('/firma/validar', firmaController.validar);

export default router;
```

### 2.5 Controller: Firma Digital del Médico

**Archivo:** `server/src/controllers/medico/firma.controller.js`

```javascript
import knex from '../../config/database.js';
import { uploadToSpaces, deleteFromSpaces } from '../../utils/spaces.js';
import sharp from 'sharp';
import crypto from 'crypto';

/**
 * Obtener firma actual del médico
 */
export async function obtener(req, res) {
    try {
        const user = await knex('users')
            .where('id', req.user.id)
            .select('firma_url', 'firma_metadatos')
            .first();

        if (!user || !user.firma_url) {
            return res.json({
                success: true,
                tieneFirma: false,
                firma: null
            });
        }

        res.json({
            success: true,
            tieneFirma: true,
            firma: {
                url: user.firma_url,
                ...user.firma_metadatos
            }
        });
    } catch (error) {
        console.error('Error obteniendo firma:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo firma'
        });
    }
}

/**
 * Subir nueva firma PNG
 * Requisitos:
 * - Formato PNG con transparencia
 * - Tamaño máximo 500KB
 * - Dimensiones recomendadas: 400x150px
 */
export async function subir(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Archivo de firma requerido'
            });
        }

        const buffer = req.file.buffer;

        // Validar y obtener metadata con Sharp
        const metadata = await sharp(buffer).metadata();

        // Validar que sea PNG
        if (metadata.format !== 'png') {
            return res.status(400).json({
                success: false,
                message: 'El archivo debe ser PNG',
                code: 'INVALID_FORMAT'
            });
        }

        // Validar que tenga canal alpha (transparencia)
        if (!metadata.hasAlpha) {
            return res.status(400).json({
                success: false,
                message: 'La imagen debe tener fondo transparente',
                code: 'NO_TRANSPARENCY'
            });
        }

        // Validar dimensiones (no demasiado pequeña)
        if (metadata.width < 100 || metadata.height < 30) {
            return res.status(400).json({
                success: false,
                message: 'La imagen es demasiado pequeña. Mínimo 100x30 px',
                code: 'TOO_SMALL'
            });
        }

        // Optimizar imagen si es muy grande
        let processedBuffer = buffer;
        if (metadata.width > 600) {
            processedBuffer = await sharp(buffer)
                .resize(600, null, { withoutEnlargement: true })
                .png({ quality: 90 })
                .toBuffer();
        }

        // Generar hash para verificación de integridad
        const hash = crypto
            .createHash('sha256')
            .update(processedBuffer)
            .digest('hex');

        // Subir a DigitalOcean Spaces
        const fileName = `firmas/${req.user.id}_${Date.now()}.png`;
        const uploadResult = await uploadToSpaces(processedBuffer, fileName, 'image/png');

        // Eliminar firma anterior si existe
        const userActual = await knex('users')
            .where('id', req.user.id)
            .select('firma_url')
            .first();

        if (userActual?.firma_url) {
            try {
                await deleteFromSpaces(userActual.firma_url);
            } catch (e) {
                console.warn('No se pudo eliminar firma anterior:', e);
            }
        }

        // Actualizar en BD
        const firmaMetadatos = {
            width: metadata.width,
            height: metadata.height,
            hash: hash,
            size: processedBuffer.length,
            updated_at: new Date().toISOString()
        };

        await knex('users')
            .where('id', req.user.id)
            .update({
                firma_url: uploadResult.url,
                firma_metadatos: firmaMetadatos,
                updated_at: knex.fn.now()
            });

        // Registrar en auditoría
        await knex('auditoria').insert({
            user_id: req.user.id,
            accion: 'subir_firma',
            recurso: 'users',
            recurso_id: req.user.id,
            detalles: { hash, size: processedBuffer.length }
        });

        res.json({
            success: true,
            message: 'Firma subida exitosamente',
            firma: {
                url: uploadResult.url,
                ...firmaMetadatos
            }
        });
    } catch (error) {
        console.error('Error subiendo firma:', error);

        if (error.message?.includes('Solo se permiten archivos PNG')) {
            return res.status(400).json({
                success: false,
                message: error.message,
                code: 'INVALID_FILE_TYPE'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error procesando firma'
        });
    }
}

/**
 * Eliminar firma del médico
 */
export async function eliminar(req, res) {
    try {
        const user = await knex('users')
            .where('id', req.user.id)
            .select('firma_url')
            .first();

        if (!user?.firma_url) {
            return res.status(404).json({
                success: false,
                message: 'No hay firma para eliminar'
            });
        }

        // Eliminar de Spaces
        await deleteFromSpaces(user.firma_url);

        // Actualizar BD
        await knex('users')
            .where('id', req.user.id)
            .update({
                firma_url: null,
                firma_metadatos: null,
                updated_at: knex.fn.now()
            });

        // Auditoría
        await knex('auditoria').insert({
            user_id: req.user.id,
            accion: 'eliminar_firma',
            recurso: 'users',
            recurso_id: req.user.id
        });

        res.json({
            success: true,
            message: 'Firma eliminada'
        });
    } catch (error) {
        console.error('Error eliminando firma:', error);
        res.status(500).json({
            success: false,
            message: 'Error eliminando firma'
        });
    }
}

/**
 * Validar una firma existente (verificar integridad)
 */
export async function validar(req, res) {
    try {
        const user = await knex('users')
            .where('id', req.user.id)
            .select('firma_url', 'firma_metadatos')
            .first();

        if (!user?.firma_url) {
            return res.json({
                success: true,
                valida: false,
                message: 'No hay firma registrada'
            });
        }

        res.json({
            success: true,
            valida: true,
            firma: {
                url: user.firma_url,
                hash: user.firma_metadatos?.hash,
                updated_at: user.firma_metadatos?.updated_at
            }
        });
    } catch (error) {
        console.error('Error validando firma:', error);
        res.status(500).json({
            success: false,
            message: 'Error validando firma'
        });
    }
}
```

---

## FASE 3: FRONTEND - DASHBOARD HANDLER MULTI-ROL

### 3.1 Modificar Entry Point

**Archivo:** `client/src/main_dashboard.js` (MODIFICAR)

Agregar lógica para cargar dashboard según rol al inicio.

### 3.2 Extender Dashboard Handler

**Archivo:** `client/src/js/dashboardHandler.js` (EXTENDER)

Agregar al `NavigationHandler`:

```javascript
// Al inicio de la clase, agregar método de detección de rol
async detectUserRole() {
    const user = JSON.parse(localStorage.getItem('genesys_user') || '{}');
    return user.rol || 'cliente_empresa';
}

// En setupNavigation(), cambiar el switch para incluir nuevos roles
setupRoleBasedNavigation() {
    const role = this.currentRole;
    const sidebar = document.querySelector('.sidebar-nav__list');

    if (role === 'admin_genesys') {
        this.loadAdminNavigation(sidebar);
    } else if (role === 'medico_ocupacional') {
        this.loadMedicoNavigation(sidebar);
    } else {
        // Default: cliente_empresa
        this.loadClienteNavigation(sidebar);
    }
}

loadAdminNavigation(sidebar) {
    const navItems = [
        { id: 'admin-home', icon: 'layout-dashboard', label: 'Dashboard', page: 'admin-home' },
        { id: 'admin-pagos', icon: 'credit-card', label: 'Gestión de Pagos', page: 'admin-pagos' },
        { id: 'admin-medicos', icon: 'stethoscope', label: 'Asignar Médicos', page: 'admin-medicos' },
        { id: 'admin-empresas', icon: 'building-2', label: 'Empresas', page: 'admin-empresas' },
        { id: 'admin-auditoria', icon: 'file-search', label: 'Auditoría', page: 'admin-auditoria' },
        { id: 'admin-config', icon: 'settings', label: 'Configuración', page: 'admin-config' }
    ];
    this.renderNavItems(sidebar, navItems);
}

loadMedicoNavigation(sidebar) {
    const navItems = [
        { id: 'medico-home', icon: 'layout-dashboard', label: 'Dashboard', page: 'medico-home' },
        { id: 'medico-empresas', icon: 'building-2', label: 'Mis Empresas', page: 'medico-empresas' },
        { id: 'medico-profesiograma', icon: 'clipboard-list', label: 'Profesiograma', page: 'medico-profesiograma' },
        { id: 'medico-examenes', icon: 'activity', label: 'Exámenes', page: 'medico-examenes' },
        { id: 'medico-firma', icon: 'pen-tool', label: 'Mi Firma Digital', page: 'medico-firma' },
        { id: 'medico-config', icon: 'settings', label: 'Configuración', page: 'medico-config' }
    ];
    this.renderNavItems(sidebar, navItems);
}
```

### 3.3 Componente: Upload de Firma Digital

**Archivo:** `client/src/js/components/medico/FirmaDigitalUploader.js`

```javascript
import { html, render } from 'lit-html';

/**
 * Componente para subir firma digital del médico
 * Requisitos: PNG con transparencia, max 500KB, recomendado 400x150px
 */
export class FirmaDigitalUploader {
    constructor(container) {
        this.container = container;
        this.firma = null;
        this.isLoading = false;
        this.error = null;
        this.validations = {
            format: { status: 'pending', message: 'Formato PNG' },
            transparency: { status: 'pending', message: 'Fondo transparente' },
            dimensions: { status: 'pending', message: 'Dimensiones adecuadas' },
            filesize: { status: 'pending', message: 'Tamaño del archivo' }
        };
    }

    async init() {
        await this.loadFirmaActual();
        this.render();
        this.setupEventListeners();
    }

    async loadFirmaActual() {
        try {
            const response = await fetch('/api/medico/firma', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            const data = await response.json();
            if (data.success && data.tieneFirma) {
                this.firma = data.firma;
            }
        } catch (error) {
            console.error('Error cargando firma:', error);
        }
    }

    render() {
        const template = html`
            <div class="firma-uploader">
                <div class="firma-uploader__header">
                    <h3 class="firma-uploader__title">
                        <i data-lucide="pen-tool"></i>
                        Firma Digital
                    </h3>
                    <p class="firma-uploader__description">
                        Tu firma aparecerá en los documentos que generes (profesiogramas, informes, etc.)
                    </p>
                </div>

                <!-- Requisitos -->
                <div class="firma-requirements">
                    <div class="requirement">
                        <i data-lucide="file-image"></i>
                        <span>Formato: PNG con transparencia</span>
                    </div>
                    <div class="requirement">
                        <i data-lucide="maximize-2"></i>
                        <span>Tamaño recomendado: 400x150 px</span>
                    </div>
                    <div class="requirement">
                        <i data-lucide="hard-drive"></i>
                        <span>Peso máximo: 500 KB</span>
                    </div>
                </div>

                ${this.firma ? this.renderFirmaExistente() : this.renderDropzone()}

                <!-- Ayuda -->
                <details class="firma-help">
                    <summary>
                        <i data-lucide="help-circle"></i>
                        ¿Cómo crear una firma con fondo transparente?
                    </summary>
                    <div class="firma-help__content">
                        <ol>
                            <li>Firma en papel blanco con tinta negra</li>
                            <li>Toma una foto o escanea la firma</li>
                            <li>Usa herramientas como <a href="https://remove.bg" target="_blank" rel="noopener">remove.bg</a> para quitar el fondo</li>
                            <li>Descarga como PNG</li>
                        </ol>
                    </div>
                </details>

                ${this.error ? html`
                    <div class="firma-error">
                        <i data-lucide="alert-circle"></i>
                        ${this.error}
                    </div>
                ` : ''}
            </div>
        `;

        render(template, this.container);

        // Inicializar iconos Lucide
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    renderDropzone() {
        return html`
            <div class="firma-dropzone"
                 @click=${() => this.triggerFileInput()}
                 @dragover=${(e) => this.handleDragOver(e)}
                 @dragleave=${(e) => this.handleDragLeave(e)}
                 @drop=${(e) => this.handleDrop(e)}
                 tabindex="0"
                 role="button"
                 aria-label="Arrastra tu firma aquí o haz clic para seleccionar">
                <input type="file"
                       id="firma-input"
                       accept="image/png"
                       @change=${(e) => this.handleFileSelect(e)}
                       hidden>

                <div class="firma-dropzone__content">
                    <i data-lucide="upload-cloud"></i>
                    <p class="firma-dropzone__title">Arrastra tu firma aquí</p>
                    <p class="firma-dropzone__hint">o haz clic para seleccionar</p>
                </div>
            </div>

            <!-- Validaciones en tiempo real -->
            <div class="firma-validations" id="firma-validations" style="display: none;">
                ${Object.entries(this.validations).map(([key, val]) => html`
                    <div class="validation-item validation-item--${val.status}">
                        <i data-lucide="${val.status === 'success' ? 'check-circle' : val.status === 'error' ? 'x-circle' : 'circle'}"></i>
                        <span>${val.message}</span>
                    </div>
                `)}
            </div>
        `;
    }

    renderFirmaExistente() {
        return html`
            <div class="firma-preview">
                <div class="firma-preview__image-container">
                    <!-- Fondo a cuadros para mostrar transparencia -->
                    <div class="firma-preview__checker-bg">
                        <img src="${this.firma.url}"
                             alt="Tu firma digital"
                             class="firma-preview__image">
                    </div>
                </div>

                <div class="firma-preview__info">
                    <span class="firma-preview__dimensions">
                        ${this.firma.width} × ${this.firma.height} px
                    </span>
                    <span class="firma-preview__date">
                        Actualizada: ${this.formatDate(this.firma.updated_at)}
                    </span>
                </div>

                <div class="firma-preview__actions">
                    <button class="btn btn--outline btn--sm"
                            @click=${() => this.cambiarFirma()}>
                        <i data-lucide="refresh-cw"></i>
                        Cambiar firma
                    </button>
                    <button class="btn btn--danger btn--sm btn--outline"
                            @click=${() => this.eliminarFirma()}>
                        <i data-lucide="trash-2"></i>
                        Eliminar
                    </button>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Keyboard support para dropzone
        const dropzone = this.container.querySelector('.firma-dropzone');
        if (dropzone) {
            dropzone.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.triggerFileInput();
                }
            });
        }
    }

    triggerFileInput() {
        document.getElementById('firma-input')?.click();
    }

    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('firma-dropzone--dragging');
    }

    handleDragLeave(e) {
        e.currentTarget.classList.remove('firma-dropzone--dragging');
    }

    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('firma-dropzone--dragging');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    async processFile(file) {
        this.error = null;
        this.showValidations();

        // Validación 1: Formato
        if (file.type !== 'image/png') {
            this.updateValidation('format', 'error', 'Debe ser PNG');
            this.error = 'El archivo debe ser formato PNG';
            this.render();
            return;
        }
        this.updateValidation('format', 'success', 'Formato PNG correcto');

        // Validación 2: Tamaño
        if (file.size > 500 * 1024) {
            this.updateValidation('filesize', 'error', `Archivo muy grande (${Math.round(file.size / 1024)} KB)`);
            this.error = 'El archivo debe ser menor a 500 KB';
            this.render();
            return;
        }
        this.updateValidation('filesize', 'success', `Tamaño: ${Math.round(file.size / 1024)} KB`);

        // Validación 3 y 4: Dimensiones y transparencia (requiere cargar imagen)
        try {
            const imageInfo = await this.analyzeImage(file);

            if (!imageInfo.hasTransparency) {
                this.updateValidation('transparency', 'error', 'Sin fondo transparente');
                this.error = 'La imagen debe tener fondo transparente';
                this.render();
                return;
            }
            this.updateValidation('transparency', 'success', 'Fondo transparente detectado');

            if (imageInfo.width < 100 || imageInfo.height < 30) {
                this.updateValidation('dimensions', 'error', `Muy pequeña (${imageInfo.width}×${imageInfo.height})`);
                this.error = 'La imagen es demasiado pequeña';
                this.render();
                return;
            }
            this.updateValidation('dimensions', 'success', `Dimensiones: ${imageInfo.width}×${imageInfo.height} px`);

            // Todo validado, subir
            await this.uploadFile(file);

        } catch (error) {
            this.error = 'Error procesando imagen';
            this.render();
        }
    }

    analyzeImage(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                // Verificar transparencia (buscar píxeles con alpha < 255)
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                let hasTransparency = false;

                for (let i = 3; i < imageData.data.length; i += 4) {
                    if (imageData.data[i] < 255) {
                        hasTransparency = true;
                        break;
                    }
                }

                resolve({
                    width: img.width,
                    height: img.height,
                    hasTransparency
                });
            };

            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    }

    async uploadFile(file) {
        this.isLoading = true;
        this.render();

        try {
            const formData = new FormData();
            formData.append('firma', file);

            const response = await fetch('/api/medico/firma', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                this.firma = data.firma;
                this.showNotification('Firma guardada exitosamente', 'success');
            } else {
                this.error = data.message || 'Error subiendo firma';
            }
        } catch (error) {
            this.error = 'Error de conexión';
        } finally {
            this.isLoading = false;
            this.render();
        }
    }

    async eliminarFirma() {
        if (!confirm('¿Estás seguro de eliminar tu firma?')) return;

        try {
            const response = await fetch('/api/medico/firma', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            const data = await response.json();

            if (data.success) {
                this.firma = null;
                this.showNotification('Firma eliminada', 'success');
                this.render();
            }
        } catch (error) {
            this.error = 'Error eliminando firma';
            this.render();
        }
    }

    cambiarFirma() {
        this.firma = null;
        this.render();
    }

    showValidations() {
        const validationsEl = document.getElementById('firma-validations');
        if (validationsEl) {
            validationsEl.style.display = 'block';
        }
    }

    updateValidation(key, status, message) {
        this.validations[key] = { status, message };
        this.render();
    }

    formatDate(dateStr) {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('es-CO', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }

    showNotification(message, type) {
        // Reutilizar sistema de notificaciones existente
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            alert(message);
        }
    }
}
```

### 3.4 Estilos: Firma Digital Uploader

**Archivo:** `client/src/styles/scss/components/_firma-uploader.scss`

```scss
@use "../components/dashboard-tokens" as tokens;

// =============================
// FIRMA DIGITAL UPLOADER
// Componente para médicos
// =============================

.firma-uploader {
    @include tokens.card-base;
    padding: tokens.$space-6;
    max-width: 600px;

    &__header {
        margin-bottom: tokens.$space-6;
    }

    &__title {
        font-family: tokens.$font-family-title;
        font-size: tokens.$font-h3;
        font-weight: tokens.$font-semibold;
        color: tokens.$dashboard-secondary;
        display: flex;
        align-items: center;
        gap: tokens.$space-2;
        margin-bottom: tokens.$space-2;

        i {
            color: tokens.$dashboard-primary;
            width: 24px;
            height: 24px;
        }
    }

    &__description {
        font-size: tokens.$font-body;
        color: tokens.$dashboard-text-light;
        line-height: tokens.$leading-relaxed;
    }
}

// =============================
// REQUISITOS
// =============================
.firma-requirements {
    display: flex;
    flex-wrap: wrap;
    gap: tokens.$space-4;
    padding: tokens.$space-4;
    background: tokens.$dashboard-background;
    border-radius: tokens.$radius-md;
    margin-bottom: tokens.$space-6;

    .requirement {
        display: flex;
        align-items: center;
        gap: tokens.$space-2;
        font-size: tokens.$font-small;
        color: tokens.$dashboard-text-light;

        i {
            width: 16px;
            height: 16px;
            color: tokens.$dashboard-primary;
        }
    }
}

// =============================
// DROPZONE
// =============================
.firma-dropzone {
    border: 2px dashed tokens.$dashboard-primary;
    border-radius: tokens.$radius-lg;
    padding: tokens.$space-8 tokens.$space-4;
    text-align: center;
    cursor: pointer;
    transition: all tokens.$transition-normal;
    background: rgba(tokens.$dashboard-primary, 0.02);

    &:hover,
    &:focus {
        border-color: tokens.$dashboard-primary-dark;
        background: rgba(tokens.$dashboard-primary, 0.05);
        outline: none;
    }

    &:focus-visible {
        box-shadow: 0 0 0 3px rgba(tokens.$dashboard-primary, 0.3);
    }

    &--dragging {
        border-color: tokens.$dashboard-success;
        background: rgba(tokens.$dashboard-success, 0.1);
        transform: scale(1.01);
    }

    &__content {
        i {
            width: 48px;
            height: 48px;
            color: tokens.$dashboard-primary;
            margin-bottom: tokens.$space-3;
        }
    }

    &__title {
        font-family: tokens.$font-family-title;
        font-size: tokens.$font-h4;
        font-weight: tokens.$font-medium;
        color: tokens.$dashboard-secondary;
        margin-bottom: tokens.$space-1;
    }

    &__hint {
        font-size: tokens.$font-small;
        color: tokens.$dashboard-text-light;
    }
}

// =============================
// VALIDACIONES
// =============================
.firma-validations {
    margin-top: tokens.$space-4;
    padding: tokens.$space-4;
    background: tokens.$dashboard-background;
    border-radius: tokens.$radius-md;
}

.validation-item {
    display: flex;
    align-items: center;
    gap: tokens.$space-2;
    font-size: tokens.$font-small;
    padding: tokens.$space-1 0;

    i {
        width: 16px;
        height: 16px;
    }

    &--pending {
        color: tokens.$dashboard-text-light;
    }

    &--success {
        color: tokens.$dashboard-success;
    }

    &--error {
        color: tokens.$dashboard-danger;
    }
}

// =============================
// PREVIEW DE FIRMA EXISTENTE
// =============================
.firma-preview {
    border: 1px solid tokens.$dashboard-border;
    border-radius: tokens.$radius-lg;
    padding: tokens.$space-4;

    &__image-container {
        display: flex;
        justify-content: center;
        margin-bottom: tokens.$space-4;
    }

    // Fondo a cuadros para mostrar transparencia
    &__checker-bg {
        background-image:
            linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
            linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
            linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
        background-size: 16px 16px;
        background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
        padding: tokens.$space-4;
        border-radius: tokens.$radius-md;
        display: inline-block;
    }

    &__image {
        max-width: 300px;
        max-height: 150px;
        display: block;
    }

    &__info {
        display: flex;
        justify-content: center;
        gap: tokens.$space-4;
        margin-bottom: tokens.$space-4;
        font-size: tokens.$font-small;
        color: tokens.$dashboard-text-light;
    }

    &__actions {
        display: flex;
        justify-content: center;
        gap: tokens.$space-3;
    }
}

// =============================
// AYUDA
// =============================
.firma-help {
    margin-top: tokens.$space-6;
    border-top: 1px solid tokens.$dashboard-border;
    padding-top: tokens.$space-4;

    summary {
        display: flex;
        align-items: center;
        gap: tokens.$space-2;
        cursor: pointer;
        font-size: tokens.$font-body;
        color: tokens.$dashboard-text-light;
        list-style: none;

        &::-webkit-details-marker {
            display: none;
        }

        i {
            width: 18px;
            height: 18px;
        }

        &:hover {
            color: tokens.$dashboard-primary;
        }
    }

    &__content {
        margin-top: tokens.$space-3;
        padding: tokens.$space-4;
        background: tokens.$dashboard-background;
        border-radius: tokens.$radius-md;

        ol {
            margin: 0;
            padding-left: tokens.$space-5;
            line-height: tokens.$leading-relaxed;
            font-size: tokens.$font-body;
            color: tokens.$dashboard-text;

            li {
                margin-bottom: tokens.$space-2;
            }
        }

        a {
            color: tokens.$dashboard-primary;
            text-decoration: none;

            &:hover {
                text-decoration: underline;
            }
        }
    }
}

// =============================
// ERROR
// =============================
.firma-error {
    display: flex;
    align-items: center;
    gap: tokens.$space-2;
    margin-top: tokens.$space-4;
    padding: tokens.$space-3 tokens.$space-4;
    background: rgba(tokens.$dashboard-danger, 0.1);
    border: 1px solid rgba(tokens.$dashboard-danger, 0.3);
    border-radius: tokens.$radius-md;
    color: tokens.$dashboard-danger;
    font-size: tokens.$font-body;

    i {
        width: 18px;
        height: 18px;
        flex-shrink: 0;
    }
}

// =============================
// RESPONSIVE
// =============================
@include tokens.respond-to('mobile') {
    .firma-requirements {
        flex-direction: column;
        gap: tokens.$space-2;
    }

    .firma-preview__actions {
        flex-direction: column;
    }
}
```

---

## FASE 4: INTEGRACIÓN DE FIRMA EN DOCUMENTOS PDF

### 4.1 Modificar Generador de Profesiograma

**Archivo:** `server/src/controllers/profesiograma.controller.js` (MODIFICAR)

Agregar función para insertar firma del médico en el PDF:

```javascript
/**
 * Insertar firma del médico en el documento PDF
 * @param {jsPDF} doc - Instancia de jsPDF
 * @param {number} yPosition - Posición Y donde insertar
 * @param {object} medico - Datos del médico incluyendo firma_url
 */
async function insertarFirmaMedico(doc, yPosition, medico) {
    if (!medico?.firma_url) {
        // Sin firma: mostrar línea para firma manual
        doc.setDrawColor(150);
        doc.line(20, yPosition + 20, 80, yPosition + 20);
        doc.setFontSize(8);
        doc.text('Firma Médico Ocupacional', 30, yPosition + 25);
        return yPosition + 30;
    }

    try {
        // Descargar imagen de firma desde Spaces
        const response = await fetch(medico.firma_url);
        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        const imgData = `data:image/png;base64,${base64}`;

        // Calcular dimensiones (max 50mm ancho, mantener proporción)
        const metadata = medico.firma_metadatos || {};
        const originalWidth = metadata.width || 400;
        const originalHeight = metadata.height || 150;
        const maxWidth = 50; // mm
        const ratio = originalHeight / originalWidth;
        const width = maxWidth;
        const height = maxWidth * ratio;

        // Insertar imagen
        doc.addImage(imgData, 'PNG', 20, yPosition, width, height);

        // Línea debajo de la firma
        doc.setDrawColor(150);
        doc.line(20, yPosition + height + 2, 20 + width, yPosition + height + 2);

        // Texto identificativo
        doc.setFontSize(8);
        doc.setFont('Poppins', 'normal');
        doc.text(medico.full_name, 20, yPosition + height + 8);
        doc.text(`Lic. SST: ${medico.licencia_sst || 'N/A'}`, 20, yPosition + height + 12);

        return yPosition + height + 18;
    } catch (error) {
        console.error('Error insertando firma en PDF:', error);
        // Fallback: línea para firma manual
        doc.setDrawColor(150);
        doc.line(20, yPosition + 20, 80, yPosition + 20);
        doc.setFontSize(8);
        doc.text('Firma Médico Ocupacional', 30, yPosition + 25);
        return yPosition + 30;
    }
}
```

---

## FASE 5: CHECKLIST DE IMPLEMENTACIÓN

### Base de Datos
- [ ] Ejecutar migración `20251212000001_enhance_roles_system.cjs`
- [ ] Ejecutar migración `20251212000002_add_medico_fields_users.cjs`
- [ ] Ejecutar migración `20251212000003_create_medicos_empresas.cjs`
- [ ] Ejecutar migración `20251212000004_create_pagos_manuales.cjs`
- [ ] Ejecutar migración `20251212000005_enhance_empresas.cjs`
- [ ] Ejecutar migración `20251212000006_create_auditoria.cjs`
- [ ] Verificar índices creados
- [ ] Crear usuario médico de prueba

### Backend
- [ ] Agregar middleware `requireMedicoAccess` a `authenticate.js`
- [ ] Crear `server/src/routes/admin.routes.js`
- [ ] Crear `server/src/routes/medico.routes.js`
- [ ] Crear controladores admin (pagos, médicos, empresas, auditoría)
- [ ] Crear controladores médico (empresas, profesiograma, firma)
- [ ] Registrar nuevas rutas en `app.js`
- [ ] Probar endpoints con Postman/Insomnia

### Frontend
- [ ] Extender `dashboardHandler.js` con navegación por rol
- [ ] Crear `FirmaDigitalUploader.js`
- [ ] Crear estilos `_firma-uploader.scss`
- [ ] Agregar páginas admin en `dashboard.html`
- [ ] Agregar páginas médico en `dashboard.html`
- [ ] Compilar y probar

### Integración Firma en PDFs
- [ ] Modificar `profesiograma.controller.js`
- [ ] Modificar `perfil-cargo.controller.js` (si aplica)
- [ ] Probar generación de PDFs con firma

### Testing
- [ ] Test login como admin_genesys
- [ ] Test login como medico_ocupacional
- [ ] Test login como cliente_empresa
- [ ] Test asignación médico-empresa
- [ ] Test upload firma PNG
- [ ] Test generación PDF con firma
- [ ] Test gestión de pagos manuales

---

## Notas de Accesibilidad (WCAG 2.1 AA)

### Implementadas
1. **Dropzone accesible**: `tabindex="0"`, `role="button"`, keyboard events
2. **Labels asociados**: Todos los inputs tienen labels o aria-label
3. **Feedback visual**: Validaciones en tiempo real con íconos + texto
4. **Contraste**: Usando colores del design system que cumplen 4.5:1

### Pendientes para Futuras Fases
1. Alternativa accesible para drag & drop de asignación médicos (vista lista con botones)
2. Skip links en navegación
3. Focus management en modales

---

## Compliance SST Colombia

| Normativa | Requisito | Implementación |
|-----------|-----------|----------------|
| Decreto 1072/2015 Art. 2.2.4.6.13 | Trazabilidad de pagos | Tabla `pagos_manuales` + `auditoria` |
| Resolución 1843/2017 | Médico ocupacional por empresa | Tabla `medicos_empresas` |
| Resolución 0312/2019 | Estándares mínimos SG-SST | Dashboard inteligencia de salud |
| Resolución 2346/2007 | Firma en exámenes médicos | Sistema de firma digital |

---

**Documento generado por análisis de agentes especializados:**
- Database Expert: Diseño de migraciones
- Backend Expert: Arquitectura de controladores y rutas
- UX/UI Auditor: Validación de flujos y accesibilidad
- Architecture Explorer: Consistencia con proyecto existente

**Próximo paso:** Aprobar este plan y comenzar implementación por fases.
