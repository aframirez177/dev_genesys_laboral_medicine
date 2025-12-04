/**
 * Auth Routes - Sprint 1
 *
 * Rutas de autenticación:
 * - POST /api/auth/login - Login por email
 * - POST /api/auth/login-empresa - Login por NIT
 * - GET /api/auth/me - Usuario actual (requiere token)
 * - POST /api/auth/register - Registrar usuario (requiere admin)
 * - POST /api/auth/change-password - Cambiar contraseña (requiere token)
 */

import { Router } from 'express';
import {
    login,
    loginEmpresa,
    getMe,
    register,
    changePassword
} from '../controllers/auth.controller.js';
import { authenticate, requireRole } from '../middleware/authenticate.js';

const router = Router();

// Rutas públicas (no requieren token)
router.post('/login', login);
router.post('/login-empresa', loginEmpresa);

// Rutas protegidas (requieren token válido)
router.get('/me', authenticate, getMe);
router.post('/change-password', authenticate, changePassword);

// Rutas de admin (requieren rol específico)
router.post('/register', authenticate, requireRole('admin_genesys'), register);

export default router;
