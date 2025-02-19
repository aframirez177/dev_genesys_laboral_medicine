-- Tabla de Empresas
CREATE TABLE empresas (
    -- ID único para cada empresa (se genera automáticamente)
    id INT PRIMARY KEY AUTO_INCREMENT,
    -- Nombre de la empresa (que usarán para iniciar sesión)
    nombre VARCHAR(255) NOT NULL UNIQUE,
    -- NIT de la empresa (que usarán como contraseña inicial)
    nit VARCHAR(20) NOT NULL UNIQUE,
    -- Contraseña encriptada
    password_hash VARCHAR(255) NOT NULL,
    -- Datos de contacto
    email VARCHAR(255) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    ciudad VARCHAR(100),
    -- Fechas de creación y actualización
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Documentos
CREATE TABLE documentos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    empresa_id INT NOT NULL,
    tipo ENUM('matriz_riesgos', 'profesiograma') NOT NULL,
    estado ENUM('borrador', 'revision', 'aprobado') NOT NULL DEFAULT 'borrador',
    version INT NOT NULL DEFAULT 1,
    url_google_sheet VARCHAR(255),
    url_pdf VARCHAR(255),
    responsable_sst VARCHAR(255),
    datos_generales JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);

-- Tabla de Cargos por Documento
CREATE TABLE cargos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    documento_id INT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    area VARCHAR(255) NOT NULL,
    zona VARCHAR(255),
    descripcion_tareas TEXT,
    tareas_rutinarias BOOLEAN DEFAULT false,
    manipula_alimentos BOOLEAN DEFAULT false,
    trabaja_alturas BOOLEAN DEFAULT false,
    trabaja_espacios_confinados BOOLEAN DEFAULT false,
    FOREIGN KEY (documento_id) REFERENCES documentos(id)
);

-- Tabla de Riesgos por Cargo
CREATE TABLE riesgos_cargo (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cargo_id INT NOT NULL,
    tipo_riesgo VARCHAR(100) NOT NULL,
    ges VARCHAR(255) NOT NULL,
    nivel_deficiencia INT,
    nivel_exposicion INT,
    nivel_consecuencia INT,
    controles_fuente TEXT,
    controles_medio TEXT,
    controles_individuo TEXT,
    FOREIGN KEY (cargo_id) REFERENCES cargos(id)
);

-- Tabla de Transacciones
CREATE TABLE transacciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    empresa_id INT NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    estado ENUM('pendiente', 'completada', 'fallida') NOT NULL,
    metodo_pago VARCHAR(50),
    referencia_pago VARCHAR(255),
    numero_cargos INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);

-- Tabla de Precios de Exámenes
CREATE TABLE precios_examenes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    codigo VARCHAR(10) NOT NULL UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio_base DECIMAL(10,2) NOT NULL,
    activo BOOLEAN DEFAULT true,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Contenido Marketing
CREATE TABLE contenido_marketing (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tipo ENUM('blog', 'infografia', 'video') NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    contenido TEXT,
    url_recurso VARCHAR(255),
    meta_descripcion TEXT,
    meta_keywords VARCHAR(255),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);