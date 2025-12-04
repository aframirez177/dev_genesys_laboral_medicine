-- =============================================
-- Script: Insertar roles requeridos por el sistema
-- Fecha: 2025-11-24
-- Descripción: Inserta roles necesarios para el funcionamiento
--              del wizard de riesgos y sistema de usuarios
-- =============================================

-- Insertar roles si no existen
INSERT INTO roles (nombre)
VALUES ('cliente_empresa')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO roles (nombre)
VALUES ('admin_genesys')
ON CONFLICT (nombre) DO NOTHING;

-- Verificar que se insertaron correctamente
SELECT * FROM roles;
