# Pooja Enterprise - B2B Tissue & Foil Platform

## Complete Setup Guide

This document provides step-by-step instructions to set up and run the Pooja Enterprise application locally.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MySQL** (v8.0 or higher) - [Download](https://dev.mysql.com/downloads/mysql/)
- **npm** or **pnpm** package manager
- **Git** (optional, for version control)

---

## 🗄️ Database Setup

### Step 1: Ensure MySQL is Running

Check if MySQL service is running:
```powershell
Get-Service -Name "*mysql*"
```

If not running, start it:
```powershell
Start-Service MySQL80
```

### Step 2: Create Database

The database `pooja_enterprise` should already be created. Verify:
```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p -e "SHOW DATABASES;"
```

### Step 3: Import Schema (Already Done)

The schema has been imported with seed data including:
- 4 product categories
- 4 products with variants
- 1 admin user (email: admin@poojaenterprise.com, password: admin123)
- All necessary tables (clients, orders, cart, sessions, etc.)

To verify:
```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p12345678 pooja_enterprise -e "SHOW TABLES;"
```

---

## ⚙️ Environment Configuration

### Step 1: Environment Variables

The `.env.local` file is already configured with:

```env
# Database Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=12345678
MYSQL_DATABASE=pooja_enterprise

# JWT Secret for Authentication
JWT_SECRET=283465c26e5a76cd20b9a82295ef4e85badcf9d191b28aee5ab55e262e89bd49056aaa08f7fe7898385219d7cd9c77bfcd8e844c5480e5431e0f16ef79b12e73

# Application Environment
NODE_ENV=development
```

**Important:** The JWT_SECRET is a cryptographically secure random string. Never commit it to version control.

---

## 📦 Installation

### Step 1: Install Dependencies

```bash
npm install
# or
pnpm install
```

Dependencies installed:
- Next.js 16.1.6
- React 19
- MySQL2 (database driver)
- bcryptjs (password hashing)
- jsonwebtoken (authentication)
- Framer Motion (animations)
- Tailwind CSS (styling)
- shadcn/ui components

---

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
# or
pnpm dev
```

The application will be available at:
- **Frontend:** http://localhost:3000
- **API:** http://localhost:3000/api

### Build for Production

```bash
npm run build
npm start
```

---

## 👥 User Accounts

### Admin Account (Pre-seeded)
- **Email:** admin@poojaenterprise.com
- **Password:** admin123
- **Access:** Full admin dashboard with analytics, order management, client management, and inventory control

### Client Account (Register New)
- Go to http://localhost:3000/register
- Fill in business details:
  - Business Name
  - Contact Person
  - Email
  - Phone
  - Password
  - GST Number (optional)
- New clients start with "pending" status and need admin approval

---

## 🎯 Key Features

### For Clients (B2B Buyers)
1. **Product Browsing**
   - Browse products by category
   - View product details with variants
   - Filter and search products

2. **Shopping Cart**
   - Add products to cart
   - Update quantities
   - Customize products (printing, sizes, colors)
   - Persistent cart (stored in database)

3. **Order Management**
   - Place orders
   - View order history
   - Track order status
   - Download invoices

4. **Profile Management**
   - Update business information
   - Manage shipping addresses
   - View account status

### For Admins
1. **Dashboard Analytics**
   - Total revenue
   - Orders count
   - Active clients
   - Low stock alerts
   - Revenue charts

2. **Order Management**
   - View all orders
   - Update order status
   - Update payment status
   - Add tracking numbers
   - Add admin notes

3. **Client Management**
   - View all clients
   - Approve/suspend accounts
   - View client order history
   - Track client spending

4. **Inventory Management**
   - View all product variants
   - Update stock quantities
   - Set low stock thresholds
   - Track stock movements

5. **Product Management**
   - Add new products
   - Edit existing products
   - Manage variants
   - Set pricing

---

## 📁 Project Structure

```
pooja-enterprise/
├── app/                      # Next.js app directory
│   ├── (admin)/             # Admin routes (protected)
│   │   ├── admin/
│   │   │   ├── dashboard/  # Admin dashboard
│   │   │   ├── orders/     # Order management
│   │   │   ├── clients/    # Client management
│   │   │   ├── stock/      # Inventory management
│   │   │   └── profile/    # Admin profile
│   ├── (dashboard)/         # Client routes (protected)
│   │   ├── dashboard/
│   │   │   ├── page.tsx    # Client dashboard
│   │   │   ├── products/   # Product browsing
│   │   │   ├── cart/       # Shopping cart
│   │   │   ├── checkout/   # Checkout process
│   │   │   ├── orders/     # Order history
│   │   │   └── profile/    # Client profile
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication (login, register, logout)
│   │   ├── products/       # Product APIs
│   │   ├── cart/           # Cart APIs
│   │   ├── orders/         # Order APIs
│   │   ├── categories/     # Category APIs
│   │   └── admin/          # Admin APIs
│   ├── about/              # About page
│   ├── contact/            # Contact page
│   ├── products/           # Public products page
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   └── page.tsx            # Home page
├── components/             # React components
│   ├── layout/            # Layout components (header, footer)
│   └── ui/                # UI components (buttons, cards, etc.)
├── lib/                   # Utility libraries
│   ├── db.ts             # Database functions (MySQL queries)
│   ├── types.ts          # TypeScript type definitions
│   └── utils.ts          # Helper functions
├── scripts/
│   └── schema.sql        # Database schema with seed data
├── public/               # Static assets
├── .env.local           # Environment variables
└── package.json         # Dependencies

```

---

## 🔧 Database Schema

### Core Tables

1. **clients** - Business customer accounts
2. **admins** - Administrator accounts
3. **sessions** - User authentication sessions
4. **categories** - Product categories
5. **products** - Product catalog
6. **product_variants** - Product variants (size, color, ply)
7. **carts** - Shopping carts
8. **cart_items** - Items in shopping carts
9. **orders** - Order records
10. **order_items** - Items in orders

### Relationships
- Clients → Orders (One-to-Many)
- Clients → Carts (One-to-One)
- Products → Variants (One-to-Many)
- Categories → Products (One-to-Many)
- Carts → Cart Items (One-to-Many)
- Orders → Order Items (One-to-Many)

---

## 🔐 Authentication & Security

### Password Security
- Passwords hashed using bcrypt (10 salt rounds)
- Never stored in plain text

### Session Management
- JWT tokens with 7-day expiration
- HTTP-only cookies for security
- Session stored in database
- Automatic session cleanup

### Role-Based Access
- Client role: Access to shopping, orders, profile
- Admin role: Access to dashboard, management features

### API Security
- All protected routes check authentication
- Role verification for admin routes
- Input validation and sanitization
- SQL injection prevention (parameterized queries)

---

## 🧪 Testing the Application

### Test User Registration
1. Go to http://localhost:3000/register
2. Create a new client account
3. Login at http://localhost:3000/login
4. Note: New accounts are "pending" - use admin to approve

### Test Admin Login
1. Go to http://localhost:3000/login
2. Use credentials: admin@poojaenterprise.com / admin123
3. Navigate to dashboard

### Test Product Browsing
1. Go to http://localhost:3000/products
2. Browse categories
3. View product details
4. Add to cart (requires login)

### Test Order Flow
1. Login as client
2. Add products to cart
3. Go to checkout
4. Fill shipping details
5. Place order
6. View order in history

### Test Admin Features
1. Login as admin
2. View dashboard analytics
3. Approve pending clients
4. Update order status
5. Manage inventory

---

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Test MySQL connection
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p12345678 pooja_enterprise -e "SELECT 1;"

# Test from Node.js
node -e "const mysql = require('mysql2/promise'); mysql.createConnection({ host: 'localhost', port: 3306, user: 'root', password: '12345678', database: 'pooja_enterprise' }).then(conn => { console.log('✓ Connected'); conn.end(); }).catch(err => { console.error('✗ Failed:', err.message); });"
```

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000
```

### Clear Node Modules
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### Database Reset
```bash
# Re-import schema
Get-Content "scripts/schema.sql" | & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p12345678 pooja_enterprise
```

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new client
- `POST /api/auth/login` - Client login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/session` - Get current session
- `POST /api/admin/auth/login` - Admin login

### Products
- `GET /api/products` - List products (with filters)
- `GET /api/products/[id]` - Get product details
- `GET /api/categories` - List categories

### Cart
- `GET /api/cart` - Get cart
- `POST /api/cart` - Add to cart
- `PATCH /api/cart/[itemId]` - Update cart item
- `DELETE /api/cart/[itemId]` - Remove cart item

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - List user orders
- `GET /api/orders/[id]` - Get order details

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/orders` - List all orders
- `PATCH /api/admin/orders/[id]` - Update order
- `GET /api/admin/clients` - List all clients
- `PATCH /api/admin/clients/[id]` - Update client status
- `GET /api/admin/stock` - List inventory
- `PATCH /api/admin/stock/[variantId]` - Update stock

---

## 🎨 Technology Stack

- **Frontend Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui
- **Animation:** Framer Motion
- **Database:** MySQL 8.0
- **Database Driver:** mysql2
- **Authentication:** JWT + bcryptjs
- **Language:** TypeScript
- **Package Manager:** npm/pnpm

---

## 📝 Additional Notes

### Production Deployment
1. Set `NODE_ENV=production` in environment
2. Update JWT_SECRET with new secure key
3. Configure production database
4. Enable HTTPS
5. Set secure cookie flags
6. Enable rate limiting
7. Set up backup strategy

### Performance Optimization
- Database indexes are already configured
- Connection pooling enabled (10 connections)
- Image optimization with Next.js
- Component lazy loading
- API response caching recommended

### Future Enhancements
- Email notifications
- PDF invoice generation
- Payment gateway integration
- Advanced reporting
- Bulk order import
- WhatsApp integration
- Multi-language support

---

## 📧 Support

For issues or questions:
- Check the troubleshooting section
- Review API error messages
- Check database logs
- Verify environment variables

---

**Last Updated:** February 1, 2026
**Version:** 1.0.0
**Status:** ✅ Fully Functional
