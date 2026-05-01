# Whole Platform Workflow

## Overview
This document describes the complete workflow of the Pooja Enterprise platform, covering all major modules:
- Client onboarding and authentication
- Product discovery and cart flow
- Checkout, payment, and order lifecycle
- Admin operations (orders, products, stock, clients, messages, payments)
- Data persistence and status transitions

## System Actors
- Visitor (unauthenticated user)
- Client (authenticated business customer)
- Admin (authenticated operations user)
- System (Frontend + Backend APIs + Database + File Storage + Email)

## High-Level Workflow
1. Visitor registers as a business client.
2. Client logs in and browses products.
3. Client adds product variants/customizations to cart.
4. Client checks out and places order.
5. If UPI payment is selected, client submits payment proof.
6. Admin verifies payment and processes order.
7. Order moves through shipping lifecycle until delivered.
8. Client tracks order and history from dashboard.

---

## 1. Visitor and Authentication Workflow

### 1.1 Client Registration
1. Visitor opens registration page.
2. Fills required details:
   - email
   - password
   - business name
   - contact person
   - phone
   - GST (optional/required by business rules)
3. Frontend validates input.
4. Backend validates format and uniqueness.
5. System stores client in `clients` table with default status.
6. Client can proceed to login.

### 1.2 Client Login
1. Client submits email/password.
2. Backend validates credentials.
3. On success:
   - session token is generated
   - session is stored in `sessions` table
   - HTTP-only cookie is set
4. Client is redirected to dashboard.

### 1.3 Session Verification
1. Protected pages call session endpoint.
2. Backend verifies token and expiry.
3. If valid, user context is returned.
4. If invalid/expired, user is redirected to login.

### 1.4 Password Recovery
1. User requests reset via email.
2. Backend creates token in `password_resets`.
3. Reset link is sent by email.
4. User submits new password.
5. Backend validates and updates password hash.

---

## 2. Product Discovery Workflow

### 2.1 Category and Product Listing
1. Client opens product catalog.
2. System fetches active categories from `categories`.
3. System fetches products from `products` with filters/search.
4. Client can open product detail page.

### 2.2 Product Detail and Variants
1. Product detail loads:
   - basic info
   - images/features/specifications
   - customization capabilities
2. Variant options are loaded from `product_variants`.
3. Price/stock are shown variant-wise.

### 2.3 Customization Handling
1. If product is customizable, user configures options.
2. Customization data is attached to cart item JSON.
3. System keeps customization linked with line item.

---

## 3. Cart Workflow

### 3.1 Add to Cart
1. Client selects variant and quantity.
2. Frontend sends cart payload.
3. Backend gets/creates client cart in `carts`.
4. Item is inserted/updated in `cart_items`.

### 3.2 Cart Updates
1. Client changes quantity or removes item.
2. Backend updates/deletes corresponding `cart_items` row.
3. Frontend refreshes totals.

### 3.3 Cart Persistence
- Cart remains associated with client account.
- Items stay available until checkout completion or manual removal.

---

## 4. Checkout Workflow

### 4.1 Address and Shipping
1. Client opens checkout.
2. Provides shipping details.
3. Chooses delivery or pickup.
4. If delivery:
   - delivery coordinates are selected
   - production coordinates are loaded from `delivery_settings`
   - distance is calculated
   - shipping cost is computed

### 4.2 Payment Method Selection
Client selects one of:
- bank_transfer
- upi
- credit_terms

### 4.3 Order Creation
1. Backend validates cart and checkout payload.
2. System calculates pricing:
   - subtotal
   - tax
   - shipping
   - discount
   - total
3. System creates order in `orders`.
4. System writes snapshots to `order_items`.
5. Cart is cleared.
6. Client gets order confirmation.

---

## 5. Payment Workflow (UPI)

### 5.1 Payment Page Initialization
1. For UPI method, client is redirected to `/payment?amount=...`.
2. Frontend calls create-payment-order API.
3. Backend creates entry in `payment_orders` with status `pending`.

### 5.2 UPI Payment
1. Client sees UPI ID, order reference, amount, and QR.
2. Client pays via UPI app.

### 5.3 Proof Submission
1. Client enters UTR.
2. Client uploads screenshot.
3. Backend stores screenshot in `public/uploads/payment-proofs`.
4. Backend updates `payment_orders`:
   - `utr`
   - `screenshot_url`
   - status `verification_pending`

### 5.4 Receipt
1. Client can click Download Receipt manually.
2. After successful proof submit, receipt auto-downloads.
3. Receipt contains payment metadata for records.

### 5.5 Admin Verification
1. Admin opens payments panel.
2. Reviews proof and UTR.
3. Approves -> status `paid`, or rejects -> status `rejected`.

---

## 6. Order Lifecycle Workflow

### 6.1 Client View
- Client sees all own orders with details and status.

### 6.2 Admin Processing
Admin updates order status through stages:
- `pending`
- `confirmed`
- `processing`
- `shipped`
- `delivered`

Alternative terminal state:
- `cancelled`

### 6.3 Tracking and Notes
Admin can update:
- tracking number
- admin notes
- payment status

### 6.4 Visibility Controls (Soft Hide)
- Delivered/cancelled orders can be hidden from admin/client list views.
- Records remain in database for history and audit.
- Hidden orders can be restored.

---

## 7. Admin Workflow (Operations)

### 7.1 Dashboard
Admin views KPIs:
- total orders
- pending actions
- client counts
- stock insights

### 7.2 Product Management
Admin can:
- create/edit products
- manage variants
- update price and stock
- activate/deactivate listings

### 7.3 Stock Management
Admin tracks variant stock and updates quantities.

### 7.4 Client Management
Admin can:
- view clients
- review status
- approve/suspend accounts

### 7.5 Contact Message Management
1. Visitor/client submits contact form.
2. Message stored in `contact_messages`.
3. Admin views inbox and replies.
4. Reply is sent by email and status is updated.

### 7.6 Payment Management
Admin reviews payment proofs and sets final payment status.

---

## 8. Data Workflow (Persistence Layer)

## Core Tables Used by Module
- Auth: `clients`, `admins`, `sessions`, `password_resets`
- Catalog: `categories`, `products`, `product_variants`
- Cart: `carts`, `cart_items`
- Orders: `orders`, `order_items`
- Delivery config: `delivery_settings`
- Payments: `payment_orders`
- Support: `contact_messages`

## File Storage
- Payment proof images: `public/uploads/payment-proofs/`

## Data Integrity
- Foreign keys enforce relational consistency.
- Unique constraints enforce identity and duplicate prevention.
- Timestamps provide lifecycle traceability.

---

## 9. API-Level Workflow Summary

### Client APIs
- Auth: `/api/auth/*`
- Catalog: `/api/categories`, `/api/products`, `/api/products/[id]`
- Cart: `/api/cart`, `/api/cart/[itemId]`
- Orders: `/api/orders`, `/api/orders/[id]`
- Payment: `/api/create-order`, `/api/submit-proof`
- Contact: `/api/contact`

### Admin APIs
- Auth: `/api/admin/auth/*`
- Orders: `/api/admin/orders`, `/api/admin/orders/[id]`
- Payments: `/api/admin/payments`, `/api/admin/payments/[orderId]`
- Products: `/api/admin/products`
- Clients: `/api/admin/clients`, `/api/admin/clients/[id]`
- Stock: `/api/admin/stock`, `/api/admin/stock/[variantId]`
- Contact: `/api/admin/contact`, `/api/admin/contact/[id]/reply`
- Settings: `/api/admin/delivery-settings`

---

## 10. Status Lifecycle Reference

### Order Status
- `pending` -> `confirmed` -> `processing` -> `shipped` -> `delivered`
- Alternate final state: `cancelled`

### Payment Status (Order)
- `pending`, `paid`, `failed`, `refunded`

### Payment Proof Status (`payment_orders`)
- `pending` -> `verification_pending` -> `paid` or `rejected`

### Contact Message Status
- `new` -> `replied`

---

## 11. End-to-End Example Scenario

1. Client logs in and adds variant products to cart.
2. Client checks out with delivery address and UPI method.
3. System creates order and payment order entry.
4. Client pays via UPI and uploads screenshot + UTR.
5. Receipt is downloaded for client records.
6. Admin verifies proof and marks payment paid.
7. Admin confirms, processes, ships, and marks order delivered.
8. Client tracks completion in order history.

---

## 12. Future Workflow Enhancements
1. Gateway-based auto-confirmation (Razorpay/Stripe webhooks).
2. Auto-link payment approval to order payment status.
3. Server-generated PDF invoice/receipt.
4. Notification workflow (email/SMS/WhatsApp) at each status transition.
5. Audit log stream for admin actions.
