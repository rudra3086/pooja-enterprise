-- Migration: Add order details to payment_orders table
-- This allows storing cart items and shipping info with payment order

ALTER TABLE payment_orders ADD COLUMN cart_items JSON DEFAULT NULL COMMENT 'Array of cart items for order';
ALTER TABLE payment_orders ADD COLUMN shipping_info JSON DEFAULT NULL COMMENT 'Shipping and order metadata';

-- These columns store the necessary data to create an actual Order when payment is verified
