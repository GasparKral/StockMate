CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       VARCHAR(150) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    full_name   VARCHAR(100) NOT NULL,
    role        VARCHAR(20)  NOT NULL DEFAULT 'OPERATOR',
    status      VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE categories (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(80)  NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE products (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku         VARCHAR(50)     NOT NULL UNIQUE,
    name        VARCHAR(150)    NOT NULL,
    description VARCHAR(500),
    category_id BIGINT          NOT NULL REFERENCES categories(id),
    unit_price  NUMERIC(10, 2)  NOT NULL,
    unit        VARCHAR(30)     NOT NULL,
    min_stock   INTEGER         NOT NULL DEFAULT 0,
    deleted     BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by  UUID            NOT NULL REFERENCES users(id)
);

CREATE TABLE stock_movements (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id      UUID        NOT NULL REFERENCES products(id),
    type            VARCHAR(10) NOT NULL,
    quantity        INTEGER     NOT NULL CHECK (quantity > 0),
    reason          VARCHAR(30) NOT NULL,
    notes           VARCHAR(300),
    registered_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    registered_by   UUID        NOT NULL REFERENCES users(id)
);

CREATE TABLE refresh_tokens (
    id          BIGSERIAL PRIMARY KEY,
    token       VARCHAR(255) NOT NULL UNIQUE,
    user_id     UUID         NOT NULL REFERENCES users(id),
    expires_at  TIMESTAMPTZ  NOT NULL,
	created_at  TIMESTAMPTZ  NOT Null DEFAULT NOW(),
    revoked     BOOLEAN      NOT NULL DEFAULT FALSE
);

CREATE SEQUENCE IF NOT EXISTS categories_seq START WITH 1 INCREMENT BY 50;
CREATE SEQUENCE IF NOT EXISTS refresh_tokens_seq START WITH 1 INCREMENT BY 50;

INSERT INTO users (email, password, full_name, role, status)
VALUES (
    'admin@example.com',
    crypt('admin', gen_salt('bf')),  -- BCrypt hash
    'Administrador',
    'ADMIN',
    'ACTIVE'
);

-- =========================
-- USERS
-- =========================
INSERT INTO users (id, email, password, full_name, role, status)
VALUES
(gen_random_uuid(), 'operator1@example.com', crypt('1234', gen_salt('bf')), 'Operador Uno', 'OPERATOR', 'ACTIVE'),
(gen_random_uuid(), 'operator2@example.com', crypt('1234', gen_salt('bf')), 'Operador Dos', 'OPERATOR', 'ACTIVE');

-- =========================
-- CATEGORIES
-- =========================
INSERT INTO categories (name, description)
VALUES
('Electrónica', 'Dispositivos electrónicos'),
('Alimentos', 'Productos comestibles'),
('Limpieza', 'Productos de limpieza'),
('Papelería', 'Artículos de oficina');

-- =========================
-- PRODUCTS
-- =========================
-- Usamos subqueries para obtener IDs reales
INSERT INTO products (sku, name, description, category_id, unit_price, unit, min_stock, created_by)
VALUES
('ELEC-001', 'Laptop Lenovo', 'Laptop 16GB RAM', 
 (SELECT id FROM categories WHERE name = 'Electrónica'),
 850.00, 'unidad', 5,
 (SELECT id FROM users WHERE email = 'admin@example.com')),

('ELEC-002', 'Mouse inalámbrico', 'Mouse óptico', 
 (SELECT id FROM categories WHERE name = 'Electrónica'),
 15.50, 'unidad', 10,
 (SELECT id FROM users WHERE email = 'admin@example.com')),

('FOOD-001', 'Arroz 1kg', 'Arroz blanco', 
 (SELECT id FROM categories WHERE name = 'Alimentos'),
 1.20, 'kg', 50,
 (SELECT id FROM users WHERE email = 'operator1@example.com')),

('CLEAN-001', 'Detergente', 'Detergente líquido', 
 (SELECT id FROM categories WHERE name = 'Limpieza'),
 3.75, 'litro', 20,
 (SELECT id FROM users WHERE email = 'operator1@example.com')),

('STAT-001', 'Cuaderno', 'Cuaderno A4', 
 (SELECT id FROM categories WHERE name = 'Papelería'),
 2.10, 'unidad', 30,
 (SELECT id FROM users WHERE email = 'operator2@example.com'));

-- =========================
-- STOCK MOVEMENTS
-- =========================
INSERT INTO stock_movements (product_id, type, quantity, reason, notes, registered_by)
VALUES
-- Entradas (compras)
((SELECT id FROM products WHERE sku = 'ELEC-001'), 'ENTRY', 10, 'PURCHASE', 'Compra inicial', 
 (SELECT id FROM users WHERE email = 'admin@example.com')),

((SELECT id FROM products WHERE sku = 'FOOD-001'), 'ENTRY', 100, 'PURCHASE', 'Proveedor local', 
 (SELECT id FROM users WHERE email = 'operator1@example.com')),

-- Salidas (ventas)
((SELECT id FROM products WHERE sku = 'FOOD-001'), 'EXIT', 20, 'SALE', 'Venta diaria', 
 (SELECT id FROM users WHERE email = 'operator1@example.com')),

((SELECT id FROM products WHERE sku = 'ELEC-002'), 'EXIT', 2, 'SALE', 'Venta mostrador', 
 (SELECT id FROM users WHERE email = 'operator2@example.com')),

-- Ajustes
((SELECT id FROM products WHERE sku = 'CLEAN-001'), 'ENTRY', 5, 'ADJUSTMENT', 'Corrección inventario', 
 (SELECT id FROM users WHERE email = 'operator1@example.com')),

((SELECT id FROM products WHERE sku = 'STAT-001'), 'EXIT', 3, 'WASTE', 'Productos dañados', 
 (SELECT id FROM users WHERE email = 'operator2@example.com'));

