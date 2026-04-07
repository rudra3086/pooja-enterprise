# Backend Architecture & Working

Comprehensive guide to how the Pooja Enterprise backend works.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 14 Frontend                      │
│              (React 18 + TypeScript + Tailwind)             │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST
┌────────────────────────▼────────────────────────────────────┐
│          Next.js Route Handlers (Backend)                   │
│              (app/api/* - TypeScript)                       │
├─────────────────────────────────────────────────────────────┤
│  • Authentication & Sessions                                │
│  • Product Catalog Management                               │
│  • Shopping Cart Operations                                 │
│  • Order Management                                         │
│  • Payment Processing & Verification                        │
│  • Admin Management                                         │
│  • Delivery Calculations                                    │
│  • Email Notifications                                      │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   ┌────────┐    ┌────────────┐    ┌──────────┐
   │ MySQL  │    │ Filesystem │    │ Nodemailer
   │Database│    │(Uploads)   │    │(Email)
   └────────┘    └────────────┘    └──────────┘
```

---

## Project Structure

```
app/
├── api/
│   ├── auth/                    # Client authentication
│   │   ├── register/route.ts
│   │   ├── login/route.ts
│   │   ├── logout/route.ts
│   │   ├── session/route.ts
│   │   └── forgot-password/route.ts
│   │
│   ├── admin/                   # Admin endpoints
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   └── session/route.ts
│   │   ├── orders/route.ts      # List/bulk ops
│   │   ├── orders/[id]/route.ts # Detail/update/delete
│   │   ├── payments/route.ts    # List payment orders
│   │   ├── payments/[orderId]/route.ts  # Update payment
│   │   ├── products/route.ts
│   │   ├── clients/route.ts
│   │   ├── stock/route.ts
│   │   ├── contact/route.ts
│   │   └── dashboard/stats/route.ts
│   │
│   ├── create-order/route.ts    # Create payment order
│   ├── submit-proof/route.ts    # Submit proof with upload
│   ├── orders/route.ts          # Client orders CRUD
│   ├── orders/[id]/route.ts
│   ├── cart/route.ts
│   ├── cart/[itemId]/route.ts
│   ├── categories/route.ts
│   ├── products/route.ts
│   ├── products/[id]/route.ts
│   ├── delivery-settings/route.ts
│   └── contact/route.ts
│
├── (admin)/
│   ├── admin/
│   │   ├── dashboard/page.tsx   # Admin dashboard
│   │   ├── orders/page.tsx      # Order management
│   │   ├── payments/page.tsx    # Payment verification UI
│   │   ├── products/page.tsx
│   │   ├── clients/page.tsx
│   │   ├── messages/page.tsx
│   │   └── stock/page.tsx
│   └── layout.tsx               # Admin layout
│
├── (dashboard)/
│   ├── dashboard/
│   │   ├── page.tsx             # Client dashboard
│   │   ├── products/page.tsx    # Product catalog
│   │   ├── cart/page.tsx        # Shopping cart
│   │   ├── checkout/page.tsx    # Checkout flow
│   │   └── orders/page.tsx      # Order tracking
│   └── layout.tsx               # Client layout
│
├── payment/page.tsx             # UPI payment form
│
lib/
├── db.ts                        # Database utilities & queries
├── types.ts                     # TypeScript interfaces
├── utils.ts                     # Helper functions
├── validation.ts                # Input validation
├── cart-context.tsx             # Cart state management
├── ai-context.ts                # AI chatbot context
└── mail.ts                      # Email templates
```

---

## Core Modules

### 1. Database Layer (`lib/db.ts`)

Centralizes all database operations using MySQL2 connection pool.

**Key Functions**:

```typescript
// Connection management
export async function getConnection(): Promise<PoolConnection>

// Schema initialization (auto-creates on first use)
async function ensureDeliverySchema()
async function ensurePaymentSchema()
async function ensureContactSchema()

// Query helpers
export async function query<T>(sql: string, params?: any[]): Promise<T>
export async function execute(sql: string, params?: any[]): Promise<ResultSetHeader>

// Client operations
export async function createClient(data): Promise<Client>
export async function getClientById(id): Promise<Client | null>
export async function updateClientProfile(id, updates): Promise<boolean>

// Product operations
export async function getProducts(options?): Promise<{ products: Product[], total: number }>
export async function getProductById(id): Promise<Product | null>
export async function getVariantById(id): Promise<ProductVariant | null>

// Cart operations
export async function getOrCreateCart(clientId): Promise<Cart>
export async function addToCart(cartId, item): Promise<CartItem>
export async function getCartItems(cartId): Promise<CartItem[]>
export async function clearCart(cartId): Promise<boolean>

// Order operations
export async function createOrder(data): Promise<Order>
export async function getOrderById(id): Promise<Order | null>
export async function getOrders(options?): Promise<{ orders: Order[], total: number }>
export async function updateOrderStatus(id, updates): Promise<boolean>

// Payment operations
export async function createPaymentOrder(data): Promise<PaymentOrder>
export async function submitPaymentProof(data): Promise<boolean>
export async function getPaymentOrders(options?): Promise<PaymentOrder[]>
export async function updatePaymentOrderStatus(orderId, status): Promise<boolean>

// Delivery calculations
export function calculateDistanceKm(lat1, lon1, lat2, lon2): number
export async function getDeliverySettings(): Promise<DeliverySettings>
```

**Connection Pool**:
- Max connections: 10
- Auto-reconnect enabled
- Persistent storage in global scope to prevent re-initialization on hot reload

---

### 2. Authentication System

#### Client Authentication Flow

```
1. Register (POST /api/auth/register)
   ├─ Validate email format & uniqueness
   ├─ Hash password with bcrypt (12 rounds)
   ├─ Create client record in DB
   └─ Return success

2. Login (POST /api/auth/login)
   ├─ Find client by email
   ├─ Compare password with hash
   ├─ Generate JWT token
   ├─ Store session in DB
   ├─ Set HTTP-only cookie
   └─ Return user data

3. Session Check (GET /api/auth/session)
   ├─ Read session_token from cookie
   ├─ Look up session in DB
   ├─ Check expiration
   ├─ Return cached user data
   └─ Return user or 401

4. Logout (POST /api/auth/logout)
   ├─ Clear session_token cookie
   └─ Return success
```

**Key Features**:
- Password hashing: bcryptjs (12 rounds)
- Token format: JWT (HS256)
- Session duration: 7 days (default) or 30 days (remember me)
- Token expiration: Checked on every authenticated request

---

#### Admin Authentication

Same flow as clients but:
- Uses `admin_session_token` cookie
- Checks `role` field (super_admin, admin, manager)
- No "remember me" feature (always 7 days)

---

### 3. Product Catalog System

**Data Structure**:
```
Category
  ├─ name, slug, description, image_url
  └─ products (1:N)

Product
  ├─ name, description, basePrice
  ├─ isCustomizable, customizationOptions
  ├─ gallery_urls, features, specifications
  └─ product_variants (1:N)

ProductVariant
  ├─ sku, name, size, color, ply
  ├─ price (can differ from base)
  └─ stock_quantity
```

**Key Operations**:

1. **Browse Products**
   - List by category or search terms
   - Pagination support (20 items/page default)
   - Filter by featured flag

2. **Product Details**
   - Fetch variants with pricing/stock
   - Customization options available?
   - Gallery images, features, specs

3. **Stock Management**
   - Track per-variant quantities
   - Low stock threshold alerts
   - No negative stock allowed

---

### 4. Shopping Cart

**Data Flow**:

```
Client Login
    ↓
getOrCreateCart(clientId)
    ├─ Check if cart exists for client
    ├─ If not, create new cart
    └─ Return cart ID

addToCart(cartId, { productId, variantId, quantity, customization })
    ├─ Validate product/variant exists
    ├─ Check customization (if applicable)
    ├─ Merge with existing item or add new
    ├─ Update timestamp
    └─ Return updated cart item

Cart Persistence:
    ├─ Stored in carts & cart_items tables
    ├─ Preserved until clearCart() called
    └─ Only one active cart per client
```

**Customization Storage**:
- Logo URL path (uploaded separately)
- Position (X, Y coordinates)
- Size/scale settings
- Additional cost for customization

---

### 5. Checkout & Orders

**Checkout Flow** (`app/(dashboard)/dashboard/checkout/page.tsx`):

```
1. Load cart items
2. Calculate totals:
   ├─ Subtotal = sum of (quantity × unit_price)
   ├─ GST (18%) = subtotal × 0.18
   ├─ Shipping:
   │   ├─ If self-pickup: ₹0
   │   └─ If shipping:
   │       ├─ Get production location
   │       ├─ Haversine distance to delivery point
   │       └─ distance_km × cost_per_km
   └─ Grand Total = subtotal + GST + shipping

3. Select payment method:
   ├─ Bank Transfer (info only)
   ├─ UPI (redirect to /payment?amount=X)
   └─ Credit Terms (info only)

4. Confirm order:
   └─ If UPI: redirect to payment page
      Else: create order directly
```

**Order Creation** (`POST /api/orders`):

```
1. Validate all shipping details
2. Get cart items
3. Calculate totals (as above)
4. Create order record in DB
5. Create order_items (snapshots)
6. Clear cart
7. Return order with ID
8. Client sees order in dashboard
```

**Order Status Flow**:
```
pending
  ├─ Admin confirms it
  └─ → confirmed
      ├─ Admin processes it
      └─ → processing
          ├─ Ship it
          └─ → shipped
              ├─ Mark delivered
              └─ → delivered (final)

Or cancel at any stage → cancelled (final)
```

---

### 6. Payment Processing (UPI)

**Payment Flow**:

```
Step 1: Checkout
├─ User selects UPI
└─ Redirects to /payment?amount=450.00

Step 2: Payment Page
├─ POST /api/create-order
│   ├─ Generate unique orderId (e.g., PO1712492400ABCD)
│   ├─ Store in payment_orders table (status=pending)
│   └─ Return orderId & amount
├─ Display static QR code (patelrudra3086@okhdfcbank)
├─ Show UPI ID, Amount, Order ID
└─ "Pay Now" opens UPI deep link:
   upi://pay?pa=patelrudra3086@okhdfcbank&am=450.00&tn=Order_PO1712492400ABCD

Step 3: User Submits Proof
├─ Upload screenshot
├─ Enter UTR (transaction ID)
└─ POST /api/submit-proof
   ├─ Save screenshot to public/uploads/payment-proofs/
   ├─ Update payment_orders record:
   │   ├─ utr = user-provided UTR
   │   ├─ screenshot_url = /uploads/payment-proofs/...
   │   └─ status = verification_pending
   ├─ Generate a downloadable HTML receipt in the browser
   └─ Redirect to /dashboard/orders

Step 4: Admin Verification
├─ Admin opens /admin/payments
├─ Views submitted proofs with UTR
├─ Can approve (Mark Paid) or reject
└─ PATCH /api/admin/payments/[orderId]
   └─ Updates payment_orders.status → paid/rejected
```

**Database Recording**:

```
payment_orders table:
├─ id: Internal payment record ID
├─ order_id: Human-readable (PO...)
├─ amount: Payment amount
├─ status: pending → verification_pending → paid/rejected
├─ utr: Transaction ID (when submitted)
├─ screenshot_url: Path to proof image
├─ client_id: Associated client (optional)
└─ timestamps: created_at, updated_at (auto)
```

**Receipt Download**:
- The receipt is generated on the client side from the payment order details already shown on the payment page.
- Users can download it manually before submitting proof, and it is downloaded automatically after successful proof submission.
- No extra database table or API route is required for receipt generation.

---

### 7. Delivery & Geolocation

**Production Location**:
- Stored in delivery_settings table (singleton, id='default')
- Default: Mumbai (21.6338638, 73.0193249)

**Distance Calculation (Haversine Formula)**:

```typescript
function calculateDistanceKm(
  originLat: number,
  originLon: number,
  destLat: number,
  destLon: number
): number {
  const R = 6371 // Earth radius in km
  const lat1 = toRadians(originLat)
  const lat2 = toRadians(destLat)
  const Δlat = toRadians(destLat - originLat)
  const Δlon = toRadians(destLon - originLon)
  
  const a = sin²(Δlat/2) + cos(lat1)×cos(lat2)×sin²(Δlon/2)
  const c = 2 × atan2(√a, √(1-a))
  return R × c
}
```

**Shipping Cost**:
```
shipping_amount = distance_km × delivery_cost_per_km
// Example: 25 km × ₹12/km = ₹300
```

**Stored in Order**:
- delivery_latitude, delivery_longitude
- production_latitude, production_longitude
- distance_km (calculated)
- delivery_cost_per_km (at time of order)

---

### 8. Admin operations

**Order Management**:
```
GET /admin/orders (with filters)
├─ status filter: pending, confirmed, processing, shipped...
├─ search: order number or client name
├─ pagination: page, pageSize
└─ view mode: active (not hidden) or removed

PATCH /admin/orders/[id]
├─ Update status (pending → confirmed → processing...)
├─ Update paymentStatus (pending → paid/failed)
├─ Add tracking number
├─ Add admin notes
└─ Auto-set shipped_at/delivered_at timestamps

DELETE /admin/orders/[id] (soft delete)
├─ Only allowed for delivered/cancelled orders
├─ Sets admin_hidden_at timestamp
└─ Order still in DB, just hidden from UI

POST /admin/orders/[id] (restore)
├─ Clears admin_hidden_at
└─ Order visible again
```

**Payment Verification**:
```
GET /admin/payments (filter by status)
├─ pending: awaiting submission
├─ verification_pending: proof submitted, awaiting approval
├─ paid: approved by admin
└─ rejected: rejected by admin

PATCH /admin/payments/[orderId]
├─ Change status to paid/rejected
├─ Updates timestamp
└─ Admin can see screenshot and UTR
```

---

### 9. Email System

**Setup** (`lib/mail.ts`):
```typescript
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD // App-specific password
  }
})
```

**Email Triggers**:

1. **Password Reset**
   - Endpoint: `POST /api/auth/forgot-password`
   - Template: Reset token link
   - To: user's email
   - TTL: 30 minutes

2. **Contact Form Reply**
   - Endpoint: `POST /api/admin/contact/[id]/reply`
   - Template: Admin's reply message
   - To: original inquirer

3. **Order Confirmation** (optional)
   - Could trigger after order creation
   - Not currently implemented

---

### 10. Input Validation

**Validation Layer** (`lib/validation.ts`):

```typescript
// Email
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Phone (Indian format)
const PHONE_REGEX = /^(\+91|0)?[6-9]\d{9}$/

// GST (Indian 15-char format)
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/

// Password minimum 8 chars
function validatePassword(pwd: string): boolean {
  return pwd.length >= 8
}
```

**Validation Locations**:
- Form submission (frontend)
- API request body (backend)
- Database constraints (backend)

---

## Request/Response Flow Example

### Complete Order Flow

```
1. CLIENT REQUEST: POST /api/orders
   {
     "requiresShipping": true,
     "shippingName": "John Doe",
     "shippingPhone": "+91 9876543210",
     "shippingAddressLine1": "123 Park",
     "shippingCity": "Mumbai",
     "shippingState": "MH",
     "shippingPostalCode": "400001",
     "deliveryLatitude": 19.0760,
     "deliveryLongitude": 73.0193,
     "paymentMethod": "upi",
     "items": [...]
   }

2. SERVER VALIDATES
   ├─ Check auth (session_token valid?)
   ├─ Check required fields
   ├─ Check cart items exist
   └─ Check product/variant still available

3. SERVER CALCULATES
   ├─ Loop through cart items:
   │   ├─ Get product details
   │   ├─ Get variant price (if exists)
   │   └─ Sum = quantity × price + customization_cost
   ├─ subtotal = sum of all items
   ├─ taxAmount = subtotal × 0.18
   ├─ distance = Haversine(production → delivery)
   ├─ shippingAmount = distance × cost_per_km
   └─ totalAmount = subtotal + tax + shipping

4. SERVER CREATES ORDER
   ├─ Start transaction
   ├─ INSERT INTO orders (...)
   ├─ INSERT INTO order_items (...)
   ├─ DELETE FROM cart_items (clear cart)
   ├─ COMMIT transaction
   └─ Retrieve and return order

5. SERVER RESPONSE: 201 Created
   {
     "success": true,
     "data": {
       "id": "order-123",
       "orderNumber": "ORD-20240407-001",
       "status": "pending",
       "paymentStatus": "pending",
       "totalAmount": 2500.00,
       "items": [...],
       "shippingAddressLine1": "123 Park",
       "createdAt": "2024-04-07T10:30:00Z"
     }
   }

6. CLIENT LOGIC
   ├─ Clear local cart state
   ├─ If paymentMethod === "upi":
   │   └─ router.push(`/payment?amount=2500.00`)
   └─ Else: router.push("/dashboard/orders")

7. PAYMENT PAGE (if UPI)
   ├─ POST /api/create-order
   │   ├─ Generate PO{timestamp}{random}
   │   └─ INSERT INTO payment_orders (pending)
   ├─ Display QR code image
   ├─ User pays via UPI app
   ├─ User submits screenshot + UTR
   └─ POST /api/submit-proof
       ├─ Save file
       ├─ UPDATE payment_orders (verification_pending)
       └─ Redirect to /dashboard/orders

8. ADMIN PATHWAY
   ├─ Open /admin/payments
   ├─ View pending verifications
   ├─ Approve: PATCH /api/admin/payments/PO...
   │   └─ status → paid
   ├─ Reject: PATCH /api/admin/payments/PO...
   │   └─ status → rejected
   └─ Admin may also link payment to order manually
```

---

## Performance Considerations

1. **Database Indexes**:
   - All foreign keys indexed
   - Status fields indexed (common filters)
   - Client/user IDs indexed (lookups)

2. **Connection Pooling**:
   - 10 max connections
   - Persistent pool in global scope
   - Auto-close idle connections

3. **Query Optimization**:
   - Use pagination (no unbounded queries)
   - Use specific column selection where possible
   - Join only when necessary

4. **File Uploads**:
   - Stored locally in `public/uploads/`
   - Max 5 MB per file (enforce on client + server)
   - Scanned filetype (only PNG/JPG/WebP)

5. **Session Management**:
   - JWT stored in HTTP-only cookies
   - Verified on every authenticated request
   - Expires after TTL

---

## Security Measures

1. **Password Storage**:
   - Bcrypt with 12 rounds (not plain text)

2. **Sessions**:
   - No sensitive data in JWT payload
   - HTTP-only cookies (prevent JS access)
   - CSRF tokens in forms (future)

3. **File Uploads**:
   - Whitelist only image types
   - Rename files (prevent file type tricks)
   - Store outside webroot (future)

4. **Input Validation**:
   - Validate all API inputs
   - Sanitize strings (prevent SQL injection via parameterized queries)
   - Type-check numerics

5. **Authorization**:
   - Check session on every request
   - Verify user owns cart/order before returning
   - Admin endpoints check user role

---

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": "Descriptive message"
}
```

**Common Errors**:
- `401 Unauthorized`: No valid session
- `400 Bad Request`: Missing/invalid fields
- `404 Not Found`: Resource doesn't exist
- `409 Conflict`: Duplicate entry (email, SKU, etc.)
- `500 Server Error`: Unexpected failure

---

## Logging & Debugging

**Current Logging**:
- `console.error()` on failures
- No persistent logs (future: Winston/Pino)

**Debug Mode**:
- Set `DEBUG=*` environment variable (future)
- No sensitive data logged (PII, passwords)

---

## Future Enhancements

1. **Payment Integration**: Stripe/Razorpay webhook auto-confirmation
2. **Notifications**: Push notifications, SMS alerts
3. **Analytics**: Order trends, revenue tracking
4. **Inventory**: Low stock auto-alerts, reorder points
5. **Reporting**: Export orders, payment records to CSV/PDF
6. **Caching**: Redis for frequently accessed data
7. **Background Jobs**: Queue for emails, exports
8. **Audit Logs**: Track all admin actions
