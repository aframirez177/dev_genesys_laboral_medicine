/**
 * Authentication Middleware - Sprint 1
 *
 * Funcionalidades:
 * - authenticate: Verifica token JWT y añade usuario decodificado a req.user
 * - requireRole: Verifica que el usuario tenga un rol específico
 * - optionalAuth: Intenta autenticar pero no falla si no hay token
 */

import jwt from 'jsonwebtoken';
import { getEnvVars } from '../config/env.js';
import knex from '../config/database.js';

const env = getEnvVars();
const JWT_SECRET = env.JWT_SECRET || 'genesys-default-secret-change-in-production';

/**
 * Middleware de autenticación obligatoria
 * Verifica el token JWT y añade usuario decodificado a req.user
 *
 * Headers esperados:
 * - Authorization: Bearer <token>
 */
export function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Token de autenticación requerido',
                code: 'NO_TOKEN'
            });
        }

        // Formato esperado: "Bearer <token>"
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({
                success: false,
                message: 'Formato de token inválido. Use: Bearer <token>',
                code: 'INVALID_FORMAT'
            });
        }

        const token = parts[1];

        // Verificar y decodificar token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Añadir usuario decodificado a la request
        req.user = decoded;

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado. Por favor inicie sesión nuevamente.',
                code: 'TOKEN_EXPIRED'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido',
                code: 'INVALID_TOKEN'
            });
        }

        console.error('Error en authenticate middleware:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno de autenticación',
            code: 'AUTH_ERROR'
        });
    }
}

/**
 * Middleware para verificar rol específico
 * Debe usarse DESPUÉS de authenticate
 *
 * @param {...string} allowedRoles - Roles permitidos (ej: 'admin_genesys', 'cliente_empresa')
 */
export function requireRole(...allowedRoles) {
    return (req, res, next) => {
        // Verificar que authenticate se ejecutó primero
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Autenticación requerida',
                code: 'NOT_AUTHENTICATED'
            });
        }

        // Si es tipo empresa, verificar si 'empresa' está en roles permitidos
        if (req.user.type === 'empresa') {
            if (allowedRoles.includes('empresa') || allowedRoles.includes('cliente_empresa')) {
                return next();
            }
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado. Permisos insuficientes.',
                code: 'FORBIDDEN'
            });
        }

        // Si es tipo usuario, verificar su rol
        const userRole = req.user.rol;

        if (!userRole) {
            return res.status(403).json({
                success: false,
                message: 'Usuario sin rol asignado',
                code: 'NO_ROLE'
            });
        }

        if (allowedRoles.includes(userRole)) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: 'Acceso denegado. Permisos insuficientes.',
            code: 'FORBIDDEN',
            required: allowedRoles,
            current: userRole
        });
    };
}

/**
 * Middleware de autenticación opcional
 * Si hay token válido, añade usuario a req.user
 * Si no hay token o es inválido, continúa sin error (req.user = null)
 *
 * Útil para rutas que funcionan diferente si el usuario está logueado
 */
export function optionalAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            req.user = null;
            return next();
        }

        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            req.user = null;
            return next();
        }

        const token = parts[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;

        next();
    } catch (error) {
        // En caso de token inválido/expirado, continuar sin usuario
        req.user = null;
        next();
    }
}

/**
 * Middleware para verificar que es una empresa específica
 * Útil para rutas donde la empresa solo puede ver sus propios datos
 *
 * @param {string} paramName - Nombre del parámetro con el empresa_id (default: 'empresaId')
 */
export function requireOwnEmpresa(paramName = 'empresaId') {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Autenticación requerida',
                code: 'NOT_AUTHENTICATED'
            });
        }

        // Admins pueden ver todo
        if (req.user.rol === 'admin_genesys') {
            return next();
        }

        const requestedEmpresaId = parseInt(req.params[paramName] || req.body[paramName] || req.query[paramName]);

        // Obtener empresa_id del usuario autenticado
        let userEmpresaId;
        if (req.user.type === 'empresa') {
            userEmpresaId = req.user.id;
        } else if (req.user.type === 'user') {
            userEmpresaId = req.user.empresa_id;
        }

        if (!userEmpresaId) {
            return res.status(403).json({
                success: false,
                message: 'Usuario no asociado a ninguna empresa',
                code: 'NO_EMPRESA'
            });
        }

        if (requestedEmpresaId && requestedEmpresaId !== userEmpresaId) {
            return res.status(403).json({
                success: false,
                message: 'No tiene permisos para acceder a esta empresa',
                code: 'WRONG_EMPRESA'
            });
        }

        // Añadir empresa_id verificada a la request para uso en controller
        req.empresaId = userEmpresaId;

        next();
    };
}

/**
 * Middleware para verificar que un médico tiene acceso a una empresa asignada
 * Debe usarse DESPUÉS de authenticate
 * Verifica en la tabla medicos_empresas que exista asignación activa
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
            // Verificar asignación activa en BD
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

            // Añadir info de asignación a request para uso en controller
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

/**
 * Middleware para verificar permisos específicos del usuario
 * Lee los permisos del JSON almacenado en la tabla roles
 *
 * @param {string} permiso - Nombre del permiso requerido
 * @param {string} nivel - Nivel de acceso: 'read', 'write', 'full' (default: 'read')
 */
export function requirePermission(permiso, nivel = 'read') {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Autenticación requerida',
                code: 'NOT_AUTHENTICATED'
            });
        }

        try {
            // Obtener permisos del rol del usuario
            const rol = await knex('roles')
                .where('id', req.user.rol_id)
                .select('permisos')
                .first();

            if (!rol || !rol.permisos) {
                return res.status(403).json({
                    success: false,
                    message: 'Usuario sin permisos definidos',
                    code: 'NO_PERMISSIONS'
                });
            }

            const permisos = typeof rol.permisos === 'string'
                ? JSON.parse(rol.permisos)
                : rol.permisos;

            const permisoValor = permisos[permiso];

            // Verificar si tiene el permiso
            if (!permisoValor) {
                return res.status(403).json({
                    success: false,
                    message: `Permiso '${permiso}' no disponible`,
                    code: 'PERMISSION_DENIED'
                });
            }

            // Verificar nivel de permiso
            if (permisoValor === 'readonly' && (nivel === 'write' || nivel === 'full')) {
                return res.status(403).json({
                    success: false,
                    message: `Permiso '${permiso}' es solo de lectura`,
                    code: 'READONLY_PERMISSION'
                });
            }

            // Añadir permisos a la request
            req.permisos = permisos;

            next();
        } catch (error) {
            console.error('Error verificando permisos:', error);
            return res.status(500).json({
                success: false,
                message: 'Error verificando permisos',
                code: 'PERMISSION_CHECK_ERROR'
            });
        }
    };
}

export default {
    authenticate,
    requireRole,
    optionalAuth,
    requireOwnEmpresa,
    requireMedicoAccess,
    requirePermission
};
