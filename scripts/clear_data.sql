-- Clear all data from tables while preserving schema
-- This script truncates all tables in reverse order of dependencies

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE delivery_settings;
TRUNCATE TABLE contact_messages;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE cart_items;
TRUNCATE TABLE carts;
TRUNCATE TABLE product_variants;
TRUNCATE TABLE products;
TRUNCATE TABLE categories;
TRUNCATE TABLE password_resets;
TRUNCATE TABLE clients;
TRUNCATE TABLE admins;
TRUNCATE TABLE sessions;
TRUNCATE TABLE payment_orders;

SET FOREIGN_KEY_CHECKS = 1;
