# Pooja Enterprise - Complete Project Documentation

Comprehensive guide to the entire Pooja Enterprise B2B Platform, covering project overview, setup, features, architecture, and workflows.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Quick Start Guide](#quick-start-guide)
4. [Project Structure](#project-structure)
5. [Key Workflows](#key-workflows)
6. [Database Schema](#database-schema)
7. [API Reference](#api-reference)
8. [Admin Features](#admin-features)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

**Pooja Enterprise** is a B2B e-commerce platform for selling tissue and paper products (and customizable items) in bulk to businesses.

### Key Characteristics

- **Target Users**: Business buyers (B2B), not individual consumers
- **Primary Market**: India (GST numbers, INR pricing, local delivery)
- **Product Range**: Tissue rolls, boxes, napkins, and customizable packaging
- **Order Type**: Bulk orders (minimum quantities apply)
- **Payment Methods**: Bank transfer, UPI (with proof verification), Credit terms
- **Delivery**: Calculated dynamically based on customer location (Haversine distance formula)
- **Customization**: Logo printing, position selection, color variants

### Business Model

```
Customer Journey:
  Register → Browse Products
    → Add to Cart (with customization)
    → Checkout (select payment method)
    → Submit Payment Proof (UPI) or Arrange Bank Transfer
    → Admin Verifies Payment
    → Order Confirmed & Processed
    → Shipped & Delivered
    → Order Completed
```

---

## ✨ Features

### For Customers (B2B Buyers)

#### 1. **Account Management**
- Register with email, business details, GST number
- Email verification required for account activation
- Password reset via email
- Profile editing
- Address management

#### 2. **Product Catalog**
- Browse by category (Tissue, Boxes, Napkins, etc.)
- Search and filter products
- View detailed product information
- See all variants (sizes, colors, ply, thickness)
- Check stock availability
- View pricing for each variant

#### 3. **Customization**
- Select products that support customization
- Upload custom logo
- Choose logo position on product
- Preview customization
- Pay additional customization fee

#### 4. **Shopping Cart**
- Add/remove items
- Adjust quantities
- Apply customization
- Persistent cart (saved between sessions)
- Real-time total calculation

#### 5. **Checkout & Ordering**
- Enter shipping address
- Select shipping method (delivery / self-pickup)
- Location-based shipping cost calculation using GPS
- Choose payment method:
  - **Bank Transfer** 👉 Account details shown
  - **UPI** 👉 QR code + dynamic payment form
  - **Credit Terms** 👉 On-account payment
- Add order notes / delivery instructions
- Place order

#### 6. **Payment (UPI Flow)**
- View static QR code (Rudra Patel's UPI ID)
- User manually scans & pays via UPI app
- Download a payment receipt from the payment page before or after proof submission
- Submit payment screenshot
- Enter UTR (transaction ID)
- System stores proof for admin verification
- Customer redirected to orders page

#### 7. **Order Tracking**
- View all orders with statuses
- Track shipping progress
- View shipping address & details
- See delivery distance (for transparency)
- Download order details (future)

#### 8. **Contact & Support**
- Submit contact form with inquiries
- Receive email reply from admin

### For Admins

#### 1. **Dashboard**
- View key metrics (total orders, revenue, pending payments)
- Quick stats on customers, products
- Recent orders at a glance

#### 2. **Order Management**
- View all orders (filterable by status, customer)
- Update order status (pending → confirmed → processing → shipped → delivered)
- Add shipping tracking number
- Add internal notes
- Mark orders as delivered
- Remove completed orders from view
- Restore removed orders

#### 3. **Payment Verification**
- View submitted payment proofs (screenshot + UTR)
- Filter by verification status:
  - **Pending** (awaiting proof submission)
  - **Verification Pending** (proof submitted, awaiting approval)
  - **Paid** (approved)
  - **Rejected** (rejected)
- Approve proof (mark as Paid)
- Reject proof (mark as Rejected)
- Comment/notes on payment (future)

#### 4. **Product Management**
- Add new products with details (name, description, price)
- Manage variants (size, color, ply, price, stock)
- Upload product images
- Set featured/active status
- Update stock levels
- Bulk import products (future)

#### 5. **Client Management**
- View all registered clients
- Filter by status (pending approval, approved, suspended)
- Approve/suspend client accounts
- View client details and order history
- Export client list (future)

#### 6. **Stock & Inventory**
- Real-time stock tracking
- Low stock alerts
- Reorder points
- Stock adjustment (if damaged, etc.)

#### 7. **Messages & Support**
- View contact form submissions
- Reply to customer inquiries
- Track reply status

#### 8. **Delivery Settings**
- Set production facility location (latitude/longitude)
- Adjust delivery cost per km
- View delivery cost breakdown for orders

#### 9. **Admin Accounts**
- Manage other admin users (create, edit, disable)
- Set role-based access (super_admin, admin, manager)

---

## 🚀 Quick Start Guide

### Prerequisites

- **Node.js**: 16.x or higher
- **MySQL**: 8.x installed and running
- **Email**: Gmail account with app-specific password (for sending emails)

### 1. Installation

```bash
# Clone repository
git clone <repository-url>
cd pooja-enterprise

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your credentials
```

### 2. Environment Setup (`.env.local`)

```bash
# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3000

# MySQL Database
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DB=pooja_enterprise

# JWT Secret (generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your-generated-secret-key-here

# Gmail SMTP (use app-specific password, not main Gmail password)
GMAIL_USER=your-email@gmail.com
GMAIL_PASSWORD=your-app-specific-password

# Optional: Map API (if using Mapbox)
# NEXT_PUBLIC_MAPBOX_TOKEN=your-token
```

### 3. Database Setup

The database schema is **automatically created** on first run. No manual SQL scripts needed.

**To manually create (optional)**:
```bash
mysql -u root -p pooja_enterprise < scripts/schema.sql
```

### 4. Start Development Server

```bash
npm run dev
```

Visit: `http://localhost:3000`

### 5. Admin Setup

Admin user must be added manually:

```bash
# Run admin creation script
node scripts/add-admin.js
# Follow prompts to create super admin
```

Or insert directly into MySQL:

```sql
INSERT INTO admins (
  id, email, password_hash, name, phone, role, is_active, created_at, updated_at
) VALUES (
  UUID(), 'admin@pooja.com', BCRYPT_HASH, 'Admin User', '+91 999999999', 'super_admin', TRUE, NOW(), NOW()
);
```

### 6. Upload Sample QR Code

Copy payment QR image to public folder:

```bash
# Place your UPI QR image at:
public/images/rudra-upi-qr.jpeg
```

Update UPI details in `app/payment/page.tsx`:
```typescript
const UPI_ID = "patelrudra3086@okhdfcbank"
const MERCHANT_NAME = "Rudra Patel"
const STATIC_QR_IMAGE = "/images/rudra-upi-qr.jpeg"
```

---

## 📁 Project Structure

```
pooja-enterprise/
├── app/
│   ├── api/                          # Backend API routes
│   │   ├── auth/                     # Client authentication
│   │   ├── admin/                    # Admin endpoints
│   │   ├── orders/                   # Order CRUD
│   │   ├── cart/                     # Cart operations
│   │   ├── create-order/             # Payment order creation
│   │   ├── submit-proof/             # Payment proof upload
│   │   ├── categories/               # Product categories
│   │   ├── products/                 # Product catalog
│   │   ├── contact/                  # Contact form
│   │   └── delivery-settings/        # Delivery config
│   │
│   ├── (admin)/
│   │   ├── admin/
│   │   │   ├── dashboard/            # Admin dashboard
│   │   │   ├── orders/               # Order management UI
│   │   │   ├── payments/             # Payment verification UI
│   │   │   ├── products/             # Product management
│   │   │   ├── clients/              # Client management
│   │   │   └── messages/             # Contact messages
│   │   └── layout.tsx                # Admin layout with sidebar
│   │
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   ├── page.tsx              # Client dashboard home
│   │   │   ├── cart/                 # Cart view
│   │   │   ├── checkout/             # Checkout page
│   │   │   ├── orders/               # Order history
│   │   │   └── products/             # Product browsing
│   │   └── layout.tsx                # Client layout with header
│   │
│   ├── payment/page.tsx              # Payment submission page
│   ├── login/page.tsx                # Client login
│   ├── register/page.tsx             # Client registration
│   ├── forgot-password/page.tsx      # Password reset
│   └── layout.tsx                    # Root layout
│
├── components/
│   ├── ui/                           # Radix UI components
│   │   ├── button.tsx, input.tsx, dialog.tsx, ...
│   │   └── 30+ reusable UI components
│   │
│   ├── layout/
│   │   ├── header.tsx                # Top navigation bar
│   │   ├── footer.tsx                # Footer
│   │   └── page-transition.tsx       # Page animation wrapper
│   │
│   ├── map/
│   │   └── location-picker.tsx       # Delivery location map picker
│   │
│   ├── theme-provider.tsx            # Dark/light mode provider
│   ├── theme-toggle.tsx              # Dark/light mode toggle
│   ├── home-chatbot.tsx              # AI chatbot widget
│   └── advanced-custom-cursor.tsx    # Custom mouse cursor
│
├── lib/
│   ├── db.ts                         # MySQL connection & queries
│   ├── types.ts                      # TypeScript interfaces
│   ├── utils.ts                      # Helper functions
│   ├── validation.ts                 # Input validation schemas
│   ├── cart-context.tsx              # Cart state management
│   ├── ai-context.ts                 # AI chatbot context
│   └── mail.ts                       # Email templates
│
├── hooks/
│   ├── use-toast.ts                  # Toast notification hook
│   └── use-mobile.ts                 # Mobile detection hook
│
├── public/
│   ├── images/
│   │   └── rudra-upi-qr.jpeg        # Payment QR code
│   └── uploads/
│       └── payment-proofs/           # Payment screenshot storage
│
├── scripts/
│   ├── schema.sql                   # Database schema (auto-created)
│   ├── add-admin.js                 # Admin creation script
│   └── fix-framer-motion-sourcemaps.js
│
├── types/
│   └── leaflet.d.ts                # Leaflet type definitions
│
├── .env.local                       # Environment variables (not committed)
├── .env.example                     # Environment template
├── next.config.mjs                  # Next.js configuration
├── tsconfig.json                    # TypeScript configuration
├── tailwind.config.ts               # Tailwind CSS configuration
├── postcss.config.mjs               # PostCSS configuration
├── package.json                     # Dependencies & scripts
└── README.md                         # Project overview
```

---

## 🔄 Key Workflows

### 1. User Registration Flow

```
1. User visits /register
2. Fills form: email, password, business name, GST, contact details
3. Submits → POST /api/auth/register
4. Backend:
   - Validates input (Zod schema)
   - Hashes password (Bcrypt, 12 rounds)
   - Checks email uniqueness
   - Creates client record in DB
   - Sends verification email (future)
5. User can now login
```

### 2. Login & Session Flow

```
1. User visits /login
2. Enters email & password
3. Submits → POST /api/auth/login
4. Backend:
   - Finds client by email
   - Compares password hash
   - Generates JWT token
   - Stores session in sessions table
   - Sets HTTP-only cookie (session_token)
5. User logged in, redirected to /dashboard
```

### 3. Shopping Flow

```
1. Browse Products (/dashboard/products)
   - GET /api/products (paginated, filtered)
   
2. View Product Details (/dashboard/products/[id])
   - GET /api/products/[id]
   - Shows variants, customization options
   
3. Add to Cart
   - POST /api/cart
   - Stores in cart_items table
   - Persists across sessions
   
4. View Cart (/dashboard/cart)
   - GET /api/cart
   - Shows items, quantities, customization
   - Real-time total calculation
   
5. Adjust Cart
   - PATCH /api/cart/[itemId]
   - DELETE /api/cart/[itemId]
```

### 4. Checkout Flow

```
1. Click "Checkout" from Cart (/dashboard/checkout)
   
2. Select Shipping Method
   - Self-Pickup (₹0 shipping)
   - Delivery (location-based cost)
   
3. If Delivery:
   - Map shows current location selector
   - Haversine formula calculates distance
   - shipping_cost = distance_km × ₹12/km
   
4. Enter Shipping Address
   - Name, phone, full address, postal code
   - Save for future orders
   
5. Review Order Summary
   - Subtotal (items)
   - GST 18% (tax)
   - Shipping cost (if applicable)
   - Total
   
6. Select Payment Method
   a) Bank Transfer → Shows account details, create order
   b) UPI → Redirect to /payment page
   c) Credit Terms → Request sent to admin
   
7. Confirm Order → POST /api/orders
   - Backend creates order with unique ID (ORD-20240407-001)
   - Creates order_items (snapshots of pricing)
   - Clears cart
   - If UPI: redirects to /payment?amount=X
   
8. Order Confirmation
   - Order appears in /dashboard/orders
   - Admin sees in /admin/orders
```

### 5. Payment Verification Flow (UPI)

```
Step 1: Payment Page (/payment)
├─ get amount from URL query
├─ POST /api/create-order
│  └─ generates PO1712492400ABCD
├─ show static QR code
├─ show UPI deep link button
└─ user scans QR or opens UPI app

Step 2: Manual Payment
├─ user pays ₹X via UPI app
├─ receives payment confirmation & UTR
└─ returns to browser

Step 3: Submit Proof
├─ upload screenshot image
├─ enter UTR number
├─ POST /api/submit-proof
│  ├─ save image to public/uploads/payment-proofs/
│  ├─ update payment_orders table
│  │  ├─ utr field
│  │  ├─ screenshot_url field
│  │  └─ status → verification_pending
│  └─ return success
├─ generate a downloadable HTML receipt in the browser
└─ redirect to /dashboard/orders

Step 4: Admin Verification (/admin/payments)
├─ admin views pending proofs
├─ sees screenshot & UTR
├─ approves (PATCH, status → paid)
│  └─ order can now ship
└─ or rejects
   └─ customer must resubmit
```

### 6. Admin Order Management

```
Dashboard (/admin/orders)
├─ View all orders
├─ Filter by status
│  ├─ pending (new orders, payment not received)
│  ├─ confirmed (payment verified)
│  ├─ processing (preparing shipment)
│  ├─ shipped (in transit)
│  └─ delivered (completed)
└─ Update order
   ├─ change status
   ├─ update payment status
   ├─ add tracking number
   ├─ add notes
   └─ PATCH /api/admin/orders/[id]

Order Archival
├─ Delete (soft) delivered/cancelled orders
│  └─ sets admin_hidden_at timestamp
├─ Restore deleted orders
│  └─ clears admin_hidden_at
└─ Bulk remove all completed
   └─ DELETE /api/admin/orders?scope=delivered|cancelled
```

### 7. Payment Verification

```
Admin Payment Panel (/admin/payments)
├─ View all payment submissions
├─ Filter by status
│  ├─ pending (awaiting proof)
│  ├─ verification_pending (proof received)
│  ├─ paid (approved)
│  └─ rejected (rejected)
├─ View proof
│  ├─ screenshot image
│  └─ UTR number
└─ Approve/Reject
   └─ PATCH /api/admin/payments/[orderId]
      ├─ status → paid
      │  └─ order ready to ship
      └─ status → rejected
         └─ customer resubmits
```

### Payment Receipt Download
- The payment page now includes a **Download Receipt** button.
- After proof submission, the app automatically downloads a browser-generated HTML receipt.
- The receipt includes merchant name, UPI ID, order ID, amount, payment status, UTR, and timestamp.

---

## 💾 Database Schema Overview

### Core Tables

1. **clients** — Registered business buyers
   - Fields: email, business_name, gst_number, address, contact_person
   - Status: pending (approval), approved, suspended

2. **products** — Product catalog
   - Fields: name, description, base_price, category_id
   - Customizable: yes/no + options

3. **product_variants** — Product variants (size, color, ply)
   - Fields: sku, name, price, stock_quantity
   - Linked to products

4. **categories** — Product categories
   - Fields: name, slug, description, image_url

5. **carts** — Shopping carts (one per client)
   - Linked to clients

6. **cart_items** — Items in cart
   - Fields: product_id, variant_id, quantity, customization

7. **orders** — Customer orders
   - Fields: order_number, status, payment_status, totals, shipping_address
   - Geolocation: delivery_latitude, delivery_longitude, distance_km

8. **order_items** — Order line items
   - Snapshot: product_name, variant_name, sku, price (at time of order)

9. **payment_orders** — UPI payment records
   - Fields: order_id (unique), amount, status, utr, screenshot_url

10. **delivery_settings** — Configuration
    - Fields: production_latitude/longitude, cost_per_km

11. **sessions** — Active user sessions
    - Fields: user_id, token, expires_at

12. **admins** — Admin users
    - Fields: email, password_hash, role, is_active

13. **contact_messages** — Contact form submissions
    - Fields: name, email, message, status, admin_reply

See [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) for complete details.

---

## 🔌 API Quick Reference

### Authentication
- `POST /api/auth/register` — Register new client
- `POST /api/auth/login` — Client login
- `GET /api/auth/session` — Check session
- `POST /api/auth/logout` — Logout
- `POST /api/auth/forgot-password` — Password reset

### Products & Catalog
- `GET /api/categories` — All categories
- `GET /api/products` — All products (paginated)
- `GET /api/products/[id]` — Product details + variants

### Cart
- `GET /api/cart` — Get cart items
- `POST /api/cart` — Add item
- `PATCH /api/cart/[itemId]` — Update quantity
- `DELETE /api/cart/[itemId]` — Remove item

### Orders
- `POST /api/orders` — Create order
- `GET /api/orders` — Client's orders
- `GET /api/orders/[id]` — Order details

### Payment
- `POST /api/create-order` — Create payment order (generates PO ID)
- `POST /api/submit-proof` — Submit screenshot + UTR

### Admin
- `GET /api/admin/orders` — List all orders
- `PATCH /api/admin/orders/[id]` — Update order status
- `DELETE /api/admin/orders/[id]` — Remove order from view
- `GET /api/admin/payments` — List payment orders
- `PATCH /api/admin/payments/[orderId]` — Approve/reject payment
- `GET /api/admin/products` — Product management
- `GET /api/admin/clients` — Client list
- `GET /api/admin/contact` — Contact messages

### Configuration
- `GET /api/delivery-settings` — Get delivery config
- `PATCH /api/admin/delivery-settings` — Update (admin only)

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for complete endpoint details with examples.

---

## 👨‍💼 Admin Features

### 1. Dashboard Widget
- Total orders (all time, this month)
- Total revenue
- Pending payments
- Active clients
- Low stock products

### 2. Order Management
- **View**: All orders in table with pagination
- **Filter**: By status, customer, date range
- **Update**: Status, shipping tracking, notes
- **Archive**: Remove completed orders
- **Restore**: Bring back archived orders
- **Export**: Download orders as CSV (future)

### 3. Payment Verification
- **View**: Submitted payment proofs
- **Verify**: See screenshot + UTR
- **Approve**: Mark as Paid
- **Reject**: Mark as Rejected
- **Filter**: By verification status

### 4. Product Management
- **Create**: Add new products
- **Upload**: Product images
- **Manage**: Variants (size, color, price, stock)
- **Update**: Product details
- **Toggle**: Active/inactive, featured

### 5. Client Management
- **View**: All clients with registration date
- **Status**: Approve/suspend accounts
- **Filter**: By status (pending, approved, suspended)
- **View**: Client details and order history

### 6. Inventory Management
- **Track**: Stock per variant
- **Alert**: Low stock notifications
- **Update**: Adjust quantities
- **History**: Stock movements (future)

### 7. Communication
- **Messages**: View contact form submissions
- **Reply**: Send email responses
- **Track**: Reply status

### 8. Settings
- **Delivery**: Set facility location (lat/long) and cost per km
- **Admin Users**: Create/manage other admins
- **Roles**: Set permissions per admin

---

## 🚀 Deployment

### Development

```bash
npm run dev
```

Server runs on `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

### Deployment Platforms

#### Vercel (Recommended for Next.js)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

1. Connect GitHub repo
2. Set environment variables in Vercel dashboard
3. Auto-deploy on `git push`

#### Manual Deployment (VPS/Cloud)

1. **Server Requirements**
   - Node.js 16+
   - MySQL 8+
   - Ubuntu 20.04 or similar

2. **Setup**
   ```bash
   # Clone repo
   git clone <repo>
   
   # Install dependencies
   npm ci
   
   # Build
   npm run build
   
   # Set environment
   export NODE_ENV=production
   export MYSQL_HOST=...
   
   # Start
   npm start
   ```

3. **Process Manager** (PM2)
   ```bash
   npm i -g pm2
   pm2 start "npm start" --name pooja-enterprise
   pm2 save
   pm2 startup
   ```

4. **Reverse Proxy** (Nginx)
   ```nginx
   server {
     listen 80;
     server_name pooja-enterprise.com;
   
     location / {
       proxy_pass http://localhost:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

5. **SSL Certificate** (Let's Encrypt)
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d pooja-enterprise.com
   ```

### Environment Variables for Production

```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://pooja-enterprise.com

MYSQL_HOST=prod-mysql.example.com
MYSQL_USER=prod_user
MYSQL_PASSWORD=strong_password_here
MYSQL_DB=pooja_enterprise_prod

JWT_SECRET=very-long-random-secret-key

GMAIL_USER=noreply@pooja-enterprise.com
GMAIL_PASSWORD=app-specific-password
```

---

## 🐛 Troubleshooting

### Database Connection Error

**Error**: `Error: connect ECONNREFUSED 127.0.0.1:3306`

**Solution**:
1. Check MySQL is running: `mysql -u root -p`
2. Verify credentials in `.env.local`
3. Create database: `mysql -u root -p -e "CREATE DATABASE pooja_enterprise;"`

### Port Already in Use

**Error**: `Error: listen EADDRINUSE :::3000`

**Solution**:
```bash
# Find process using port 3000
lsof -i :3000
# Kill it
kill -9 <PID>
# Or use different port
PORT=3001 npm run dev
```

### JWT Token Not Working

**Error**: `Error: invalid signature` or `401 Unauthorized`

**Solution**:
1. Check `JWT_SECRET` is set in `.env.local`
2. Verify secret is same across restarts (not random every time)
3. Check token hasn't expired (7 or 30 days)
4. Clear cookies in browser

### Email Not Sending

**Error**: `Error: Invalid login: 535-5.7.8 Username and password not accepted`

**Solution**:
1. Use Gmail app-specific password (not main password)
2. Enable "Less secure" apps (if app password not available)
3. Check `GMAIL_USER` and `GMAIL_PASSWORD` are correct
4. Test email: `node scripts/test-email.js`

### Payment Screenshot Not Uploading

**Error**: `Error: ENOENT: no such file or directory, open 'public/uploads/payment-proofs/...'`

**Solution**:
1. Create directory: `mkdir -p public/uploads/payment-proofs/`
2. Check file permissions: `chmod 755 public/uploads/`
3. Verify file size < 5 MB
4. Check image format (PNG, JPG, WebP only)

### TypeScript Errors on Build

**Error**: `error TS2304: Cannot find name 'SomeType'`

**Solution**:
```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build

# Or check import paths (lib vs app paths)
```

### Page Shows Blank

**Error**: Page loads but shows nothing

**Solution**:
1. Check browser console for errors (F12)
2. Check server terminal for API errors
3. Verify database connection
4. Check `.env.local` variables are set
5. Try hard refresh: Ctrl+Shift+R

### Admin Login Not Working

**Error**: `Invalid credentials`

**Solution**:
1. Verify admin exists in database: `SELECT * FROM admins WHERE email='admin@pooja.com';`
2. If not, create using script: `node scripts/add-admin.js`
3. Check password hash is correct (bcrypt)
4. Try password reset: `POST /api/auth/forgot-password`

---

## 📚 Additional Resources

### Documentation Files
- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) — Complete database structure
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) — All API endpoints
- [BACKEND_ARCHITECTURE.md](BACKEND_ARCHITECTURE.md) — Backend logic and workflows
- [TECHNOLOGIES.md](TECHNOLOGIES.md) — Tech stack and libraries

### Code References
- `lib/db.ts` — Database queries (all operations)
- `lib/types.ts` — TypeScript interfaces
- `app/api/` — API route implementations
- `components/` — UI component library

### External Links
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/)
- [MySQL Documentation](https://dev.mysql.com/doc/)

---

## 📞 Support & Contact

For issues or questions:
1. Check this documentation first
2. Review [Troubleshooting](#troubleshooting) section
3. Check [backend-architecture.md](BACKEND_ARCHITECTURE.md) for detailed workflows
4. Review database schema if data-related
5. Check API docs for endpoint issues

---

## 📄 License & Credits

**Project**: Pooja Enterprise B2B Platform
**Version**: 1.0.0
**Last Updated**: April 2024

**Tech Stack**:
- Next.js 14 + React 18 + TypeScript
- Tailwind CSS + Radix UI
- MySQL 8 + Node.js
- Framer Motion + GSAP animations

**Key Contributors**:
- Development: Charusat SGP Team
- UPI Payment System: Payment verification with Rudra Patel's UPI
- UI/UX: Radix UI + Tailwind CSS

---

## 🎉 Getting Help

**For Development Issues**:
1. Check server logs: `npm run dev` console
2. Check browser console (F12)
3. Check database directly: `mysql ...`

**For Deployment Issues**:
1. Check environment variables
2. Check database connectivity
3. Check port/firewall settings
4. Check logs: `pm2 logs`

**For Payment Issues**:
1. Ensure QR image exists: `public/images/rudra-upi-qr.jpeg`
2. Check UPI ID in code matches image
3. Verify upload directory exists: `public/uploads/payment-proofs/`
4. Check file permissions

---

## 🔄 Project Roadmap

### Completed ✅
- User registration & authentication
- Product catalog with variants
- Shopping cart system
- Order creation & management
- UPI payment verification with proof submission
- Admin dashboard & order management
- Payment approval/rejection system
- Delivery cost calculation
- Customer orders tracking
- Contact form submissions

### In Progress 🔄
- Payment webhook auto-verification
- Email order notifications
- Inventory alerts

### Planned 🔮
- Bulk product import
- CSV order export
- Admin audit logs
- Customer reviews
- Coupon system
- WhatsApp integration
- Razorpay/Stripe integration
- Real-time order notifications
- Mobile app (React Native)

---

**End of Documentation**

For more details, see individual documentation files listed above.
