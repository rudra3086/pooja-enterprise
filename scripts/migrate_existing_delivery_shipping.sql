-- Safe migration for EXISTING database (keeps all current data)
-- Adds delivery settings + shipping distance metadata for orders
-- MySQL 8.0+

START TRANSACTION;

-- 0) Create contact messages table if missing
CREATE TABLE IF NOT EXISTS contact_messages (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  phone VARCHAR(20),
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('new', 'replied') DEFAULT 'new',
  admin_reply TEXT,
  replied_by_admin_id VARCHAR(36),
  replied_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_created (created_at),
  INDEX idx_email (email)
);

-- 1) Create delivery settings table if missing
CREATE TABLE IF NOT EXISTS delivery_settings (
    id VARCHAR(36) PRIMARY KEY,
    production_latitude DECIMAL(10, 7) NOT NULL,
    production_longitude DECIMAL(10, 7) NOT NULL,
    delivery_cost_per_km DECIMAL(10, 2) NOT NULL DEFAULT 12.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2) Ensure default settings row exists (do not overwrite existing values)
INSERT INTO delivery_settings (id, production_latitude, production_longitude, delivery_cost_per_km)
VALUES ('default', 21.6338638, 73.0193249, 12.00)
ON DUPLICATE KEY UPDATE id = id;

-- 3) Add new order columns only when missing
SET @db_name = DATABASE();

SET @exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @db_name
      AND TABLE_NAME = 'orders'
      AND COLUMN_NAME = 'requires_shipping'
);
SET @sql = IF(@exists = 0,
    'ALTER TABLE orders ADD COLUMN requires_shipping BOOLEAN NOT NULL DEFAULT TRUE',
    'SELECT "orders.requires_shipping already exists"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @db_name
      AND TABLE_NAME = 'orders'
      AND COLUMN_NAME = 'delivery_latitude'
);
SET @sql = IF(@exists = 0,
    'ALTER TABLE orders ADD COLUMN delivery_latitude DECIMAL(10, 7) NULL',
    'SELECT "orders.delivery_latitude already exists"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @db_name
      AND TABLE_NAME = 'orders'
      AND COLUMN_NAME = 'delivery_longitude'
);
SET @sql = IF(@exists = 0,
    'ALTER TABLE orders ADD COLUMN delivery_longitude DECIMAL(10, 7) NULL',
    'SELECT "orders.delivery_longitude already exists"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @db_name
      AND TABLE_NAME = 'orders'
      AND COLUMN_NAME = 'production_latitude'
);
SET @sql = IF(@exists = 0,
    'ALTER TABLE orders ADD COLUMN production_latitude DECIMAL(10, 7) NULL',
    'SELECT "orders.production_latitude already exists"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @db_name
      AND TABLE_NAME = 'orders'
      AND COLUMN_NAME = 'production_longitude'
);
SET @sql = IF(@exists = 0,
    'ALTER TABLE orders ADD COLUMN production_longitude DECIMAL(10, 7) NULL',
    'SELECT "orders.production_longitude already exists"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @db_name
      AND TABLE_NAME = 'orders'
      AND COLUMN_NAME = 'distance_km'
);
SET @sql = IF(@exists = 0,
    'ALTER TABLE orders ADD COLUMN distance_km DECIMAL(10, 2) NULL',
    'SELECT "orders.distance_km already exists"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @db_name
      AND TABLE_NAME = 'orders'
      AND COLUMN_NAME = 'delivery_cost_per_km'
);
SET @sql = IF(@exists = 0,
    'ALTER TABLE orders ADD COLUMN delivery_cost_per_km DECIMAL(10, 2) NULL',
    'SELECT "orders.delivery_cost_per_km already exists"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

COMMIT;

-- Optional verification
SELECT * FROM delivery_settings WHERE id = 'default';
SHOW COLUMNS FROM orders LIKE 'requires_shipping';
SHOW COLUMNS FROM orders LIKE 'delivery_latitude';
SHOW COLUMNS FROM orders LIKE 'delivery_longitude';
SHOW COLUMNS FROM orders LIKE 'production_latitude';
SHOW COLUMNS FROM orders LIKE 'production_longitude';
SHOW COLUMNS FROM orders LIKE 'distance_km';
SHOW COLUMNS FROM orders LIKE 'delivery_cost_per_km';
