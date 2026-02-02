# Quick Start Guide - Pooja Enterprise

## 🚀 Get Started in 3 Minutes

### Step 1: Verify MySQL is Running
```powershell
Get-Service MySQL80
```
If not running: `Start-Service MySQL80`

### Step 2: Start the Application
```bash
npm run dev
```

### Step 3: Access the Application
Open browser: **http://localhost:3000**

---

## 👤 Test Accounts

### Admin Account (Pre-configured)
```
Email: admin@poojaenterprise.com
Password: admin123
URL: http://localhost:3000/login
```

### Client Account (Register New)
```
URL: http://localhost:3000/register
Note: New accounts need admin approval
```

---

## 🎯 Quick Test Flow

### Test User Journey (5 minutes)

1. **Register New Client**
   - Go to /register
   - Fill: Business Name, Email, Phone, Password
   - Click "Create Account"

2. **Approve Client (Admin)**
   - Login as admin
   - Go to Clients page
   - Find new client
   - Click "Approve"

3. **Browse & Add to Cart (Client)**
   - Login as client
   - Browse /dashboard/products
   - Click product → Add to cart
   - View cart

4. **Place Order**
   - Go to checkout
   - Fill shipping details
   - Place order
   - View in order history

5. **Manage Order (Admin)**
   - Login as admin
   - Go to Orders
   - Update order status
   - Add tracking number

---

## 📊 Key URLs

### Public
- Home: `http://localhost:3000`
- Products: `http://localhost:3000/products`
- About: `http://localhost:3000/about`
- Contact: `http://localhost:3000/contact`

### Client Dashboard
- Dashboard: `http://localhost:3000/dashboard`
- Products: `http://localhost:3000/dashboard/products`
- Cart: `http://localhost:3000/dashboard/cart`
- Orders: `http://localhost:3000/dashboard/orders`
- Profile: `http://localhost:3000/dashboard/profile`

### Admin Dashboard
- Dashboard: `http://localhost:3000/admin/dashboard`
- Orders: `http://localhost:3000/admin/orders`
- Clients: `http://localhost:3000/admin/clients`
- Stock: `http://localhost:3000/admin/stock`

---

## 🔧 Quick Commands

### Development
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production
npm start
```

### Database
```bash
# Check tables
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p12345678 pooja_enterprise -e "SHOW TABLES;"

# Check products
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p12345678 pooja_enterprise -e "SELECT id, name FROM products;"

# Check admin
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p12345678 pooja_enterprise -e "SELECT email FROM admins;"
```

---

## 🛠️ Troubleshooting

### Can't Connect to Database
```bash
# Test connection
node -e "require('mysql2/promise').createConnection({host:'localhost',user:'root',password:'12345678',database:'pooja_enterprise'}).then(c=>{console.log('✓ OK');c.end()}).catch(e=>console.log('✗',e.message))"
```

### Port 3000 Already in Use
```bash
npx kill-port 3000
```

### App Won't Start
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## 📝 Database Info

### Connection Details
```
Host: localhost
Port: 3306
User: root
Password: 12345678
Database: pooja_enterprise
```

### Tables (10)
- admins, clients, sessions
- categories, products, product_variants
- carts, cart_items, orders, order_items

### Seed Data
- 1 Admin user
- 4 Categories
- 4 Products
- 15 Product variants

---

## ✅ Feature Checklist

- [x] User registration & login
- [x] Admin login & dashboard
- [x] Product browsing
- [x] Shopping cart
- [x] Order placement
- [x] Order tracking
- [x] Client management
- [x] Inventory management
- [x] Analytics dashboard
- [x] Role-based access
- [x] Session management
- [x] Database integration

---

## 📖 Full Documentation

- **Setup Guide:** [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)
- **Implementation:** [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
- **Database Schema:** [scripts/schema.sql](scripts/schema.sql)

---

## 🎉 You're Ready!

The application is fully functional. Start testing and enjoy! 🚀

**Questions?** Check the full documentation or review the implementation summary.
