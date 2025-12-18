/**
 * Auth Controller - Sprint 1
 * Maneja autenticación de usuarios y empresas
 *
 * Endpoints:
 * - POST /api/auth/login - Login por email (usuarios)
 * - POST /api/auth/login-empresa - Login por NIT (empresas)
 * - GET /api/auth/me - Obtener usuario actual
 * - POST /api/auth/logout - Invalidar sesión (frontend)
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';
import { getEnvVars } from '../config/env.js';

const env = getEnvVars();
const JWT_SECRET = env.JWT_SECRET || 'genesys-default-secret-change-in-production';
const JWT_EXPIRES = '24h';

/**
 * Login por email (usuarios internos y empleados de empresa)
 * POST /api/auth/login
 * Body: { email, password }
 */
export async function login(req, res) {
    try {
        const { email, password } = req.body;

        console.log('🔐 Intento de login:', { email, passwordLength: password?.length });

        // Validación básica
        if (!email || !password) {
            console.log('❌ Faltan credenciales');
            return res.status(400).json({
                success: false,
                message: 'Email y contraseña son requeridos'
            });
        }

        // Buscar usuario con su rol y empresa
        console.log('🔍 Buscando usuario en BD...');
        const user = await db('users')
            .leftJoin('roles', 'users.rol_id', 'roles.id')
            .leftJoin('empresas', 'users.empresa_id', 'empresas.id')
            .select(
                'users.id',
                'users.full_name',
                'users.email',
                'users.phone',
                'users.password_hash',
                'users.empresa_id',
                'users.licencia_sst',
                'users.especialidad',
                'roles.nombre as rol',
                'empresas.nit as empresa_nit',
                'empresas.nombre_legal as empresa_nombre'
            )
            .where('users.email', email.toLowerCase().trim())
            .first();

        if (!user) {
            console.log('❌ Usuario no encontrado en BD para email:', email);
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        console.log('✅ Usuario encontrado:', { id: user.id, email: user.email, rol: user.rol, hasPassword: !!user.password_hash });

        // Verificar que tenga password configurado
        if (!user.password_hash) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no tiene contraseña configurada. Contacte al administrador.'
            });
        }

        // Verificar contraseña
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Generar JWT
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                rol: user.rol,
                empresa_id: user.empresa_id,
                type: 'user'
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES }
        );

        // Respuesta sin password_hash
        const { password_hash, ...userWithoutPassword } = user;

        res.json({
            success: true,
            message: 'Login exitoso',
            token,
            user: userWithoutPassword
        });

    } catch (error) {
        console.error('❌ Error en login:', error.message);
        console.error('Stack:', error.stack);

        // Si es error de BD, dar más info
        if (error.code) {
            console.error('Código de error BD:', error.code);
        }

        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            debug: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

/**
 * Login por NIT (empresas cliente)
 * POST /api/auth/login-empresa
 * Body: { nit, password }
 */
export async function loginEmpresa(req, res) {
    try {
        const { nit, password } = req.body;

        // Validación básica
        if (!nit || !password) {
            return res.status(400).json({
                success: false,
                message: 'NIT y contraseña son requeridos'
            });
        }

        // Buscar empresa
        const empresa = await db('empresas')
            .select('id', 'nit', 'nombre_legal', 'password_hash')
            .where('nit', nit.trim())
            .first();

        if (!empresa) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Verificar contraseña
        const isValidPassword = await bcrypt.compare(password, empresa.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Generar JWT
        const token = jwt.sign(
            {
                id: empresa.id,
                nit: empresa.nit,
                nombre: empresa.nombre_legal,
                type: 'empresa'
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES }
        );

        res.json({
            success: true,
            message: 'Login exitoso',
            token,
            empresa: {
                id: empresa.id,
                nit: empresa.nit,
                nombre_legal: empresa.nombre_legal
            }
        });

    } catch (error) {
        console.error('Error en loginEmpresa:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Obtener usuario/empresa actual desde token
 * GET /api/auth/me
 * Headers: Authorization: Bearer <token>
 */
export async function getMe(req, res) {
    try {
        // El middleware authenticate ya decodificó el token y lo puso en req.user
        const decoded = req.user;

        if (decoded.type === 'user') {
            const user = await db('users')
                .leftJoin('roles', 'users.rol_id', 'roles.id')
                .leftJoin('empresas', 'users.empresa_id', 'empresas.id')
                .select(
                    'users.id',
                    'users.full_name',
                    'users.email',
                    'users.phone',
                    'users.empresa_id',
                    'roles.nombre as rol',
                    'empresas.nit as empresa_nit',
                    'empresas.nombre_legal as empresa_nombre'
                )
                .where('users.id', decoded.id)
                .first();

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            return res.json({
                success: true,
                type: 'user',
                data: user
            });
        }

        if (decoded.type === 'empresa') {
            const empresa = await db('empresas')
                .select('id', 'nit', 'nombre_legal')
                .where('id', decoded.id)
                .first();

            if (!empresa) {
                return res.status(404).json({
                    success: false,
                    message: 'Empresa no encontrada'
                });
            }

            return res.json({
                success: true,
                type: 'empresa',
                data: empresa
            });
        }

        res.status(400).json({
            success: false,
            message: 'Tipo de token inválido'
        });

    } catch (error) {
        console.error('Error en getMe:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Registrar nuevo usuario (solo admins)
 * POST /api/auth/register
 * Body: { email, password, full_name, phone?, empresa_id?, rol_id? }
 */
export async function register(req, res) {
    try {
        const { email, password, full_name, phone, empresa_id, rol_id } = req.body;

        // Validación básica
        if (!email || !password || !full_name) {
            return res.status(400).json({
                success: false,
                message: 'Email, contraseña y nombre completo son requeridos'
            });
        }

        // Verificar que no exista el email
        const existingUser = await db('users')
            .where('email', email.toLowerCase().trim())
            .first();

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'El email ya está registrado'
            });
        }

        // Hash de contraseña
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Insertar usuario
        const [newUser] = await db('users')
            .insert({
                email: email.toLowerCase().trim(),
                password_hash,
                full_name: full_name.trim(),
                phone: phone?.trim() || null,
                empresa_id: empresa_id || null,
                rol_id: rol_id || null
            })
            .returning(['id', 'email', 'full_name', 'phone', 'empresa_id', 'rol_id']);

        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            user: newUser
        });

    } catch (error) {
        console.error('Error en register:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Cambiar contraseña
 * POST /api/auth/change-password
 * Body: { currentPassword, newPassword }
 */
export async function changePassword(req, res) {
    try {
        const { currentPassword, newPassword } = req.body;
        const decoded = req.user;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Contraseña actual y nueva son requeridas'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'La nueva contraseña debe tener al menos 6 caracteres'
            });
        }

        let table, idField;
        if (decoded.type === 'user') {
            table = 'users';
            idField = 'id';
        } else if (decoded.type === 'empresa') {
            table = 'empresas';
            idField = 'id';
        } else {
            return res.status(400).json({
                success: false,
                message: 'Tipo de token inválido'
            });
        }

        // Obtener hash actual
        const record = await db(table)
            .select('password_hash')
            .where(idField, decoded.id)
            .first();

        if (!record) {
            return res.status(404).json({
                success: false,
                message: 'Registro no encontrado'
            });
        }

        // Verificar contraseña actual
        const isValid = await bcrypt.compare(currentPassword, record.password_hash);
        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: 'Contraseña actual incorrecta'
            });
        }

        // Hash nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash(newPassword, salt);

        // Actualizar
        await db(table)
            .where(idField, decoded.id)
            .update({ password_hash: newHash });

        res.json({
            success: true,
            message: 'Contraseña actualizada exitosamente'
        });

    } catch (error) {
        console.error('Error en changePassword:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

export default {
    login,
    loginEmpresa,
    getMe,
    register,
    changePassword
};
