-- Pooja Enterprise B2B Database Schema
-- MySQL 8.0+

-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS carts;
DROP TABLE IF EXISTS product_variants;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS clients;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS sessions;

-- =====================================================
-- USERS & AUTHENTICATION
-- =====================================================

-- Clients (B2B customers)
CREATE TABLE clients (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    
    -- Business Information
    business_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    gst_number VARCHAR(20),
    
    -- Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'India',
    
    -- Status
    status ENUM('pending', 'approved', 'suspended') DEFAULT 'pending',
    email_verified BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_business_name (business_name)
);

-- Admin users
CREATE TABLE admins (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('super_admin', 'admin', 'manager') DEFAULT 'admin',
    avatar_url VARCHAR(500),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Sessions for authentication
CREATE TABLE sessions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    user_type ENUM('client', 'admin') NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    
    -- Metadata
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_token (token),
    INDEX idx_user (user_id, user_type),
    INDEX idx_expires (expires_at)
);

-- =====================================================
-- PRODUCTS & CATEGORIES
-- =====================================================

-- Product categories
CREATE TABLE categories (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(500),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_slug (slug),
    INDEX idx_active (is_active)
);

-- Products
CREATE TABLE products (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    category_id VARCHAR(36) NOT NULL,
    
    -- Basic Info
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    short_description VARCHAR(500),
    
    -- Pricing
    base_price DECIMAL(10, 2) NOT NULL,
    min_order_quantity INT DEFAULT 1,
    
    -- Media
    image_url VARCHAR(500),
    gallery_urls JSON,
    
    -- Features
    features JSON,
    specifications JSON,
    
    -- Customization
    is_customizable BOOLEAN DEFAULT FALSE,
    customization_options JSON,
    -- Example: {"sizes": ["Small", "Medium", "Large"], "colors": ["White", "Blue"], "printing": true}
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    INDEX idx_category (category_id),
    INDEX idx_slug (slug),
    INDEX idx_active (is_active),
    INDEX idx_featured (is_featured)
);

-- Product variants (for different sizes, colors, etc.)
CREATE TABLE product_variants (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    product_id VARCHAR(36) NOT NULL,
    
    -- Variant Details
    sku VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    
    -- Attributes
    size VARCHAR(50),
    color VARCHAR(50),
    ply VARCHAR(20),
    thickness VARCHAR(50),
    width VARCHAR(50),
    
    -- Pricing & Stock
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    low_stock_threshold INT DEFAULT 10,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product (product_id),
    INDEX idx_sku (sku),
    INDEX idx_stock (stock_quantity)
);

-- =====================================================
-- CART & ORDERS
-- =====================================================

-- Shopping carts
CREATE TABLE carts (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    client_id VARCHAR(36) NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    INDEX idx_client (client_id)
);

-- Cart items
CREATE TABLE cart_items (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    cart_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    variant_id VARCHAR(36),
    
    -- Quantity
    quantity INT NOT NULL DEFAULT 1,
    
    -- Customization
    customization JSON,
    -- Example: {"size": "Large", "color": "White", "printing": {"enabled": true, "text": "Hotel ABC"}}
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL,
    INDEX idx_cart (cart_id),
    INDEX idx_product (product_id)
);

-- Orders
CREATE TABLE orders (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    client_id VARCHAR(36) NOT NULL,
    order_number VARCHAR(20) NOT NULL UNIQUE,
    
    -- Status
    status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    payment_method ENUM('bank_transfer', 'upi', 'credit_terms') DEFAULT 'bank_transfer',
    
    -- Pricing
    subtotal DECIMAL(12, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    shipping_amount DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL,
    
    -- Shipping Address
    shipping_name VARCHAR(255) NOT NULL,
    shipping_phone VARCHAR(20) NOT NULL,
    shipping_address_line1 VARCHAR(255) NOT NULL,
    shipping_address_line2 VARCHAR(255),
    shipping_city VARCHAR(100) NOT NULL,
    shipping_state VARCHAR(100) NOT NULL,
    shipping_postal_code VARCHAR(20) NOT NULL,
    shipping_country VARCHAR(100) DEFAULT 'India',
    
    -- Notes
    customer_notes TEXT,
    admin_notes TEXT,
    
    -- Tracking
    tracking_number VARCHAR(100),
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT,
    INDEX idx_client (client_id),
    INDEX idx_order_number (order_number),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_created (created_at)
);

-- Order items
CREATE TABLE order_items (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    order_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    variant_id VARCHAR(36),
    
    -- Product snapshot (in case product details change)
    product_name VARCHAR(255) NOT NULL,
    variant_name VARCHAR(255),
    sku VARCHAR(100),
    
    -- Quantity & Pricing
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    
    -- Customization
    customization JSON,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL,
    INDEX idx_order (order_id),
    INDEX idx_product (product_id)
);

-- =====================================================
-- SEED DATA
-- =====================================================

-- Insert default admin (password: admin123)
-- Password hash generated with bcryptjs (compatible with login system): bcryptjs.hashSync('admin123', 10)
INSERT INTO admins (id, email, password_hash, name, role) VALUES
('admin-1', 'admin@poojaenterprise.com', '$2b$10$Nepj4NTP2hmNLBYLPeHDGOTw5DhyZtvsbVV3pbYx6MNHlY0vCnG0G', 'Admin User', 'super_admin');

-- Insert categories
INSERT INTO categories (id, name, slug, description, sort_order) VALUES
('cat-1', 'Tissue Napkins', 'tissue-napkins', 'Premium quality napkins for restaurants, hotels, and catering services.', 1),
('cat-2', 'Tissue Rolls', 'tissue-rolls', 'Soft and absorbent tissue rolls for commercial and industrial use.', 2),
('cat-3', 'Ultra Soft Tissues', 'ultra-soft-tissues', 'Premium ultra-soft tissues for luxury hospitality experiences.', 3),
('cat-4', 'Aluminium Foil', 'aluminium-foil', 'Food-grade aluminum foil for packaging and kitchen applications.', 4);

-- Insert products
INSERT INTO products (id, category_id, name, slug, description, short_description, base_price, min_order_quantity, image_url, is_customizable, customization_options, features, is_featured) VALUES
('prod-1', 'cat-1', 'Tissue Napkin', 'tissue-napkin', 'Premium quality napkins perfect for restaurants, hotels, and catering services. Available in various sizes and ply options.', 'Premium quality napkins for restaurants and hotels.', 150.00, 100, '/images/tissue-napkins.jpg', TRUE, '{"sizes": ["23x23cm", "30x30cm", "33x33cm"], "colors": ["White", "Cream", "Light Blue"], "ply": ["1-Ply", "2-Ply"], "printing": true}', '["1-ply and 2-ply options", "Multiple size variants", "Custom printing available", "Bulk discounts"]', TRUE),

('prod-2', 'cat-2', 'Tissue Roll', 'tissue-roll', 'Soft and absorbent tissue rolls designed for commercial and industrial use. High sheet count per roll for cost efficiency.', 'Soft and absorbent tissue rolls for commercial use.', 45.00, 50, '/images/tissue-rolls.jpg', TRUE, '{"sizes": ["Small", "Medium", "Large", "Jumbo"], "ply": ["1-Ply", "2-Ply", "3-Ply"], "sheets": ["100 sheets", "200 sheets", "500 sheets"]}', '["High absorbency", "Soft texture", "Large sheet count", "Eco-friendly options"]', TRUE),

('prod-3', 'cat-3', 'Ultra Soft Tissue Napkin', 'ultra-soft-tissue', 'Premium ultra-soft tissues for luxury hospitality experiences. Ideal for fine dining and high-end establishments.', 'Extra soft tissues for premium hospitality experiences.', 250.00, 50, '/images/facial-tissue.jpg', TRUE, '{"sizes": ["23x23cm", "30x30cm"], "colors": ["White", "Ivory"], "ply": ["2-Ply", "3-Ply"], "printing": true, "embossing": true}', '["Extra soft texture", "Premium quality", "Elegant presentation", "Custom branding"]', TRUE),

('prod-4', 'cat-4', 'Aluminium Foil', 'aluminium-foil', 'Food-grade aluminum foil for packaging, wrapping, and kitchen applications. Available in various thicknesses and widths.', 'Food-grade aluminum foil for packaging and kitchen use.', 180.00, 25, '/images/aluminum-foil.jpg', FALSE, NULL, '["Food-grade certified", "Various thicknesses", "Multiple widths", "Heat resistant"]', TRUE);

-- Insert product variants
INSERT INTO product_variants (id, product_id, sku, name, size, color, ply, price, stock_quantity) VALUES
-- Tissue Napkin variants
('var-1-1', 'prod-1', 'TN-23-W-1P', 'Tissue Napkin 23x23cm White 1-Ply', '23x23cm', 'White', '1-Ply', 150.00, 5000),
('var-1-2', 'prod-1', 'TN-23-W-2P', 'Tissue Napkin 23x23cm White 2-Ply', '23x23cm', 'White', '2-Ply', 200.00, 4000),
('var-1-3', 'prod-1', 'TN-30-W-1P', 'Tissue Napkin 30x30cm White 1-Ply', '30x30cm', 'White', '1-Ply', 180.00, 3500),
('var-1-4', 'prod-1', 'TN-30-W-2P', 'Tissue Napkin 30x30cm White 2-Ply', '30x30cm', 'White', '2-Ply', 230.00, 3000),
('var-1-5', 'prod-1', 'TN-33-W-2P', 'Tissue Napkin 33x33cm White 2-Ply', '33x33cm', 'White', '2-Ply', 280.00, 2500),

-- Tissue Roll variants
('var-2-1', 'prod-2', 'TR-S-1P-100', 'Tissue Roll Small 1-Ply 100 sheets', 'Small', NULL, '1-Ply', 45.00, 10000),
('var-2-2', 'prod-2', 'TR-M-2P-200', 'Tissue Roll Medium 2-Ply 200 sheets', 'Medium', NULL, '2-Ply', 75.00, 8000),
('var-2-3', 'prod-2', 'TR-L-2P-500', 'Tissue Roll Large 2-Ply 500 sheets', 'Large', NULL, '2-Ply', 120.00, 6000),
('var-2-4', 'prod-2', 'TR-J-3P-500', 'Tissue Roll Jumbo 3-Ply 500 sheets', 'Jumbo', NULL, '3-Ply', 180.00, 4000),

-- Ultra Soft variants
('var-3-1', 'prod-3', 'US-23-W-2P', 'Ultra Soft 23x23cm White 2-Ply', '23x23cm', 'White', '2-Ply', 250.00, 2000),
('var-3-2', 'prod-3', 'US-23-I-3P', 'Ultra Soft 23x23cm Ivory 3-Ply', '23x23cm', 'Ivory', '3-Ply', 320.00, 1500),
('var-3-3', 'prod-3', 'US-30-W-3P', 'Ultra Soft 30x30cm White 3-Ply', '30x30cm', 'White', '3-Ply', 380.00, 1200),

-- Aluminium Foil variants
('var-4-1', 'prod-4', 'AF-9-STD', 'Aluminium Foil 9m Standard', '9 meters', NULL, NULL, 180.00, 3000),
('var-4-2', 'prod-4', 'AF-18-STD', 'Aluminium Foil 18m Standard', '18 meters', NULL, NULL, 320.00, 2500),
('var-4-3', 'prod-4', 'AF-72-HD', 'Aluminium Foil 72m Heavy Duty', '72 meters', NULL, NULL, 850.00, 1500);

-- Update variant thickness/width for aluminium foil
UPDATE product_variants SET thickness = '11 micron', width = '30cm' WHERE product_id = 'prod-4';
