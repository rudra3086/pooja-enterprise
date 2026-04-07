# Database Schema Documentation

## Overview
Pooja Enterprise uses MySQL 8+ as the primary database. This document outlines all tables, their relationships, and key characteristics.

---

## Table Structure

### 1. **clients** — Business client accounts
Stores registered B2B client information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(36) | PRIMARY KEY | Unique client identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Client email address |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| business_name | VARCHAR(255) | NOT NULL | Registered business name |
| contact_person | VARCHAR(255) | NOT NULL | Contact person name |
| phone | VARCHAR(20) | NOT NULL | Contact phone number |
| gst_number | VARCHAR(50) | UNIQUE, NULL | Indian GST registration number |
| address_line1 | VARCHAR(255) | NULL | Street address |
| address_line2 | VARCHAR(255) | NULL | Address continued |
| city | VARCHAR(100) | NULL | City name |
| state | VARCHAR(100) | NULL | State/Province |
| postal_code | VARCHAR(10) | NULL | Postal/ZIP code |
| country | VARCHAR(100) | NULL | Country |
| status | ENUM('pending', 'approved', 'suspended') | NOT NULL | Approval status |
| email_verified | BOOLEAN | DEFAULT FALSE | Email verification flag |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation time |
| updated_at | TIMESTAMP | AUTO UPDATE | Last modification time |

**Indexes**: `UNIQUE(email)`, `UNIQUE(gst_number)`, `INDEX(status)`

---

### 2. **admins** — Administrative users
Stores admin user credentials and profiles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(36) | PRIMARY KEY | Unique admin identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Admin email |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| name | VARCHAR(255) | NOT NULL | Admin full name |
| phone | VARCHAR(20) | NULL | Admin phone |
| role | ENUM('super_admin', 'admin', 'manager') | NOT NULL | Role level |
| avatar_url | VARCHAR(500) | NULL | Profile photo URL |
| is_active | BOOLEAN | DEFAULT TRUE | Account active status |
| last_login | TIMESTAMP | NULL | Last login timestamp |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | AUTO UPDATE | Last modification time |

**Indexes**: `UNIQUE(email)`, `INDEX(is_active)`, `INDEX(role)`

---

### 3. **sessions** — Authentication sessions
Stores active user sessions with JWT tokens.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(36) | PRIMARY KEY | Session identifier |
| user_id | VARCHAR(36) | NOT NULL | Reference to client or admin |
| user_type | ENUM('client', 'admin') | NOT NULL | Type of user |
| token | VARCHAR(500) | UNIQUE, NOT NULL | JWT token |
| expires_at | TIMESTAMP | NOT NULL | Token expiration time |
| ip_address | VARCHAR(45) | NULL | User's IP address |
| user_agent | VARCHAR(500) | NULL | Browser/client info |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |

**Indexes**: `INDEX(user_id)`, `INDEX(token)`, `INDEX(expires_at)`

---

### 4. **categories** — Product categories
Organizes products into categories.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(36) | PRIMARY KEY | Category ID |
| name | VARCHAR(255) | NOT NULL | Category name |
| slug | VARCHAR(255) | UNIQUE, NOT NULL | URL-friendly slug |
| description | TEXT | NULL | Category description |
| image_url | VARCHAR(500) | NULL | Category image |
| sort_order | INT | NULL | Display order |
| is_active | BOOLEAN | DEFAULT TRUE | Visibility flag |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | AUTO UPDATE | Last modification time |

**Indexes**: `UNIQUE(slug)`, `INDEX(is_active)`

---

### 5. **products** — Product listings
Core product catalog.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(36) | PRIMARY KEY | Product ID |
| category_id | VARCHAR(36) | FOREIGN KEY | Link to categories |
| name | VARCHAR(255) | NOT NULL | Product name |
| slug | VARCHAR(255) | UNIQUE, NOT NULL | URL slug |
| description | LONGTEXT | NULL | Full description |
| short_description | VARCHAR(500) | NULL | Brief description |
| base_price | DECIMAL(10, 2) | NOT NULL | Starting price |
| min_order_quantity | INT | DEFAULT 1 | Minimum order qty |
| image_url | VARCHAR(500) | NULL | Primary image |
| gallery_urls | JSON | NULL | Array of image URLs |
| features | JSON | NULL | Features list |
| specifications | JSON | NULL | Spec key-value pairs |
| is_customizable | BOOLEAN | DEFAULT FALSE | Supports customization |
| customization_options | JSON | NULL | Customization config |
| is_active | BOOLEAN | DEFAULT TRUE | Visibility |
| is_featured | BOOLEAN | DEFAULT FALSE | Featured flag |
| meta_title | VARCHAR(255) | NULL | SEO title |
| meta_description | VARCHAR(500) | NULL | SEO description |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | AUTO UPDATE | Last modification time |

**Indexes**: `FOREIGN KEY(category_id)`, `UNIQUE(slug)`, `INDEX(is_active)`

---

### 6. **product_variants** — Product variants
Variants include different sizes, colors, SKUs, etc.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(36) | PRIMARY KEY | Variant ID |
| product_id | VARCHAR(36) | FOREIGN KEY | Link to products |
| sku | VARCHAR(100) | UNIQUE, NOT NULL | Stock Keeping Unit |
| name | VARCHAR(255) | NOT NULL | Variant name/label |
| size | VARCHAR(100) | NULL | Size (e.g., A4, 10x10) |
| color | VARCHAR(100) | NULL | Color variant |
| ply | VARCHAR(50) | NULL | Ply count |
| thickness | VARCHAR(50) | NULL | Thickness spec |
| width | VARCHAR(50) | NULL | Width spec |
| price | DECIMAL(10, 2) | NOT NULL | Variant price |
| stock_quantity | INT | NOT NULL | Available stock |
| low_stock_threshold | INT | DEFAULT 10 | Low stock warning level |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | AUTO UPDATE | Last modification time |

**Indexes**: `FOREIGN KEY(product_id)`, `UNIQUE(sku)`, `INDEX(stock_quantity)`

---

### 7. **carts** — Shopping carts
Stores active shopping carts per client.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(36) | PRIMARY KEY | Cart ID |
| client_id | VARCHAR(36) | UNIQUE, NOT NULL | Link to clients |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | AUTO UPDATE | Last modification time |

**Indexes**: `UNIQUE(client_id)`

---

### 8. **cart_items** — Cart line items
Line items in a cart.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(36) | PRIMARY KEY | Item ID |
| cart_id | VARCHAR(36) | NOT NULL, FOREIGN KEY | Link to carts |
| product_id | VARCHAR(36) | NOT NULL | Link to products |
| variant_id | VARCHAR(36) | NULL | Link to variant (optional) |
| quantity | INT | NOT NULL | Item quantity |
| customization | JSON | NULL | Custom details (logo, position, etc.) |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | AUTO UPDATE | Last modification time |

**Indexes**: `FOREIGN KEY(cart_id)`, `FOREIGN KEY(product_id)`, `INDEX(variant_id)`

---

### 9. **orders** — Customer orders
Main order records with comprehensive metadata.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(36) | PRIMARY KEY | Order ID |
| client_id | VARCHAR(36) | NOT NULL, FOREIGN KEY | Link to clients |
| order_number | VARCHAR(50) | UNIQUE, NOT NULL | Human-readable order # |
| status | ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') | NOT NULL | Order status |
| payment_status | ENUM('pending', 'paid', 'failed', 'refunded') | NOT NULL | Payment status |
| payment_method | ENUM('bank_transfer', 'upi', 'credit_terms') | NOT NULL | Payment method |
| subtotal | DECIMAL(12, 2) | NOT NULL | Pre-tax total |
| tax_amount | DECIMAL(10, 2) | NOT NULL | GST (18%) |
| shipping_amount | DECIMAL(10, 2) | NOT NULL | Delivery cost |
| discount_amount | DECIMAL(10, 2) | DEFAULT 0 | Applied discount |
| total_amount | DECIMAL(12, 2) | NOT NULL | Grand total |
| shipping_name | VARCHAR(255) | NOT NULL | Recipient name |
| shipping_phone | VARCHAR(20) | NOT NULL | Recipient phone |
| shipping_address_line1 | VARCHAR(255) | NOT NULL | Delivery address |
| shipping_address_line2 | VARCHAR(255) | NULL | Address continued |
| shipping_city | VARCHAR(100) | NOT NULL | Delivery city |
| shipping_state | VARCHAR(100) | NOT NULL | Delivery state |
| shipping_postal_code | VARCHAR(10) | NOT NULL | Delivery postal code |
| shipping_country | VARCHAR(100) | DEFAULT 'India' | Delivery country |
| requires_shipping | BOOLEAN | DEFAULT TRUE | Shipping required flag |
| delivery_latitude | DECIMAL(10, 7) | NULL | Delivery GPS latitude |
| delivery_longitude | DECIMAL(10, 7) | NULL | Delivery GPS longitude |
| production_latitude | DECIMAL(10, 7) | NULL | Production facility GPS lat |
| production_longitude | DECIMAL(10, 7) | NULL | Production facility GPS long |
| distance_km | DECIMAL(10, 2) | NULL | Calculated delivery distance |
| delivery_cost_per_km | DECIMAL(10, 2) | NULL | Applied cost rate |
| customer_notes | TEXT | NULL | Special instructions |
| admin_notes | TEXT | NULL | Internal notes |
| tracking_number | VARCHAR(100) | NULL | Shipment tracking # |
| shipped_at | TIMESTAMP | NULL | Shipment date |
| delivered_at | TIMESTAMP | NULL | Delivery date |
| admin_hidden_at | TIMESTAMP | NULL | Admin UI hide timestamp |
| client_hidden_at | TIMESTAMP | NULL | Client UI hide timestamp |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Order creation time |
| updated_at | TIMESTAMP | AUTO UPDATE | Last modification time |

**Indexes**: `FOREIGN KEY(client_id)`, `UNIQUE(order_number)`, `INDEX(status)`, `INDEX(payment_status)`, `INDEX(created_at)`

---

### 10. **order_items** — Order line items
Products/variants in orders with snapshots.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(36) | PRIMARY KEY | Item ID |
| order_id | VARCHAR(36) | NOT NULL, FOREIGN KEY | Link to orders |
| product_id | VARCHAR(36) | NOT NULL | Product reference |
| variant_id | VARCHAR(36) | NULL | Variant reference |
| product_name | VARCHAR(255) | NOT NULL | Snapshot: product name |
| variant_name | VARCHAR(255) | NULL | Snapshot: variant name |
| sku | VARCHAR(100) | NULL | Snapshot: SKU |
| quantity | INT | NOT NULL | Order quantity |
| unit_price | DECIMAL(10, 2) | NOT NULL | Snapshot: unit price |
| total_price | DECIMAL(12, 2) | NOT NULL | Line total |
| customization | JSON | NULL | Custom details (logo, position, etc.) |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |

**Indexes**: `FOREIGN KEY(order_id)`, `FOREIGN KEY(product_id)`

---

### 11. **contact_messages** — Contact form submissions
Inquiries from website contact form.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(36) | PRIMARY KEY | Message ID |
| name | VARCHAR(255) | NOT NULL | Sender name |
| email | VARCHAR(255) | NOT NULL | Sender email |
| company | VARCHAR(255) | NULL | Sender company |
| phone | VARCHAR(20) | NULL | Sender phone |
| subject | VARCHAR(255) | NOT NULL | Message subject |
| message | LONGTEXT | NOT NULL | Message body |
| status | ENUM('new', 'replied') | DEFAULT 'new' | Reply status |
| admin_reply | LONGTEXT | NULL | Admin response |
| replied_by_admin_id | VARCHAR(36) | NULL | Admin who replied |
| replied_at | TIMESTAMP | NULL | Reply time |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Submission time |
| updated_at | TIMESTAMP | AUTO UPDATE | Last modification time |

**Indexes**: `INDEX(status)`, `INDEX(email)`, `INDEX(created_at)`

---

### 12. **delivery_settings** — Delivery configuration
Global delivery pricing and location settings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(36) | PRIMARY KEY | Settings ID (always 'default') |
| production_latitude | DECIMAL(10, 7) | NOT NULL | Facility GPS latitude |
| production_longitude | DECIMAL(10, 7) | NOT NULL | Facility GPS longitude |
| delivery_cost_per_km | DECIMAL(10, 2) | DEFAULT 12.00 | Cost per km rate |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | AUTO UPDATE | Last modification time |

---

### 13. **payment_orders** — UPI payment verification
Stores UPI payment submission records and proof.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(36) | PRIMARY KEY | Payment record ID |
| order_id | VARCHAR(64) | UNIQUE, NOT NULL | Unique payment order ID (e.g., PO1712492400ABCD) |
| client_id | VARCHAR(36) | NULL | Link to clients (optional) |
| amount | DECIMAL(10, 2) | NOT NULL | Payment amount |
| status | ENUM('pending', 'verification_pending', 'paid', 'rejected') | DEFAULT 'pending' | Payment status |
| utr | VARCHAR(128) | NULL | Transaction reference number |
| screenshot_url | TEXT | NULL | Payment proof image path |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Payment order creation time |
| updated_at | TIMESTAMP | AUTO UPDATE | Last modification time |

**Indexes**: `UNIQUE(order_id)`, `INDEX(status)`, `INDEX(client_id)`

---

## Relationships

```
clients
  ├── carts (1:1) → cart_items → products/product_variants
  ├── orders (1:N) → order_items → products/product_variants
  ├── contact_messages (1:N)
  └── payment_orders (1:N)

products
  ├── categories (N:1)
  ├── product_variants (1:N)
  ├── cart_items (1:N)
  └── order_items (1:N)

admins
  └── contact_messages (1:N) [replied_by_admin_id]

delivery_settings (singleton, id='default')
  └── orders (reference via distance calculation)
```

---

## Key Constraints & Cascade Rules

- **Foreign Keys**: No CASCADE DELETE on relationships; soft-deletes used instead
- **Unique Fields**: email (clients, admins), sku (variants), slug (categories, products), order_number, order_id (payment_orders)
- **Timestamps**: All tables include `created_at` and `updated_at` (auto-update on modification)
- **Soft Deletes**: Orders use `admin_hidden_at` and `client_hidden_at` instead of deletion

---

## Notes

1. **JSON Columns**: `gallery_urls`, `features`, `specifications`, `customization_options`, `customization` store complex nested data as JSON
2. **Snapshot Pattern**: `order_items` stores product/variant details at time of order to maintain historical accuracy
3. **Geolocation**: Latitude/longitude stored with 7 decimal places (~11mm precision)
4. **Payment Status Machine**: `pending` → `verification_pending` → `paid`/`rejected`
5. **Order Status Flow**: `pending` → `confirmed` → `processing` → `shipped` → `delivered` (or `cancelled` at any step)
6. **Session TTL**: Sessions expire based on `expires_at` timestamp
7. **Delivery Cost Calculation**: `shipping_amount = distance_km * delivery_cost_per_km` (Haversine distance formula)
