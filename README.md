# Pooja Enterprise — B2B Ordering Platform

A full-stack Next.js 14 application for B2B tissue and packaging sales, with separate client and admin portals, MySQL persistence, map-based delivery pricing, customization flows, contact inbox/reply workflow, and operational controls for order/message management.

---

## 1) What this project does

This platform allows business customers to:
- Register and log in.
- Browse products/variants.
- Customize products (logo upload + position/size where applicable).
- Build cart and place orders.
- Track order history and details.

And allows admins to:
- Manage products, clients, stock, and order statuses.
- Configure production location and delivery cost-per-km.
- Review and reply to contact inquiries by email.
- Clean up inquiries.
- Hide delivered/cancelled orders from admin UI and restore them later.

---

## 2) Tech stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Radix UI components.
- **Backend**: Next.js Route Handlers (`app/api/*`).
- **Database**: MySQL 8+ with `mysql2/promise`.
- **Auth**: JWT + server-side session table + HTTP-only cookies.
- **Email**: Nodemailer (Gmail/App Password or custom SMTP).
- **Maps**: Leaflet / React-Leaflet for location selection.
- **Animations/UI**: Framer Motion, Lucide icons.

---

## 3) Functional modules (complete)

## 3.1 Public website
- Home, About, Contact, Products, Login/Register/Forgot/Reset pages.
- Contact form persists inquiries to DB and can optionally notify admin email.

## 3.2 Client authentication & account
- Client registration with validation:
	- email format
	- phone format
	- GST format (Indian GST)
	- password minimum length
- Client login with **Remember me for 30 days** support.
- Forgot/reset password via token email flow.
- Session endpoint to fetch current logged-in user.

## 3.3 Client profile
- Editable profile fields: contact, company, GST, address.
- Backend validation + duplicate email prevention.
- Address rendering fix prevents repeated country appending (e.g., `India, India, ...`).

## 3.4 Product catalog and customization
- Category/product listing and product details.
- Variant-aware pricing/stock.
- Customization flow enforces upload-first behavior before position/size + add-to-cart.

## 3.5 Cart and checkout
- Cart CRUD, quantity updates, remove items.
- Checkout supports:
	- shipping required or self-pickup
	- map-selected delivery location when shipping is enabled
	- payment method selection
	- customer notes

## 3.6 Orders (client)
- Place order from cart and persist order + item snapshots.
- Status tracking and detailed order modal.
- Delivered date visible for delivered orders.
- Product images shown in order details.
- Dashboard “Recent Orders → View Details” deep-links directly to that order details modal.

## 3.7 Delivery pricing and map logic
- Delivery settings table stores:
	- production latitude/longitude
	- delivery cost per km
- Shipping amount computed dynamically via Haversine distance.
- Orders store delivery + production coordinates, distance, and applied cost-per-km.
- In admin order details, delivery coordinates are clickable and open Google Maps.

## 3.8 Admin authentication & profile
- Admin login endpoint with secure cookie session.
- Admin profile and password APIs.

## 3.9 Admin product/client/stock operations
- Product management APIs and UI.
- Client listing and status controls.
- Stock/variant management with low-stock visibility.

## 3.10 Admin order operations
- View all active orders with filters/search.
- Update order status.
- View full order detail (items/customization/shipping/payment metadata).
- **Remove from UI** (soft hide, not DB delete) only for `delivered` and `cancelled` orders.
- Bulk remove only for `delivered` or `cancelled`.
- **Restore removed orders** from “Removed Orders” view.

> Note: Order “delete” is intentionally implemented as UI hide (`admin_hidden_at`) to preserve historical data.

## 3.11 Admin messages (contact inbox)
- Fetch inquiries (`new` / `replied` / `all`).
- Reply to inquiry from admin panel.
- Reply is sent as email to the original inquirer.
- Delete controls:
	- delete single inquiry
	- delete all replied inquiries
	- delete all inquiries

---

## 4) API overview

### Auth (client)
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/session`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/validate-reset-token`

### Auth (admin)
- `POST /api/admin/auth/login`
- `GET /api/admin/auth/session`

### Catalog & shopping
- `GET /api/categories`
- `GET /api/products`
- `GET /api/products/[id]`
- `GET/POST /api/cart`
- `PATCH/DELETE /api/cart/[itemId]`

### Orders
- Client:
	- `GET /api/orders`
	- `POST /api/orders`
	- `GET /api/orders/[id]`
- Admin:
	- `GET /api/admin/orders`
	- `DELETE /api/admin/orders` (bulk UI-remove: delivered/cancelled)
	- `GET/PATCH/DELETE/POST /api/admin/orders/[id]`
		- `DELETE`: remove from admin UI (soft hide)
		- `POST`: restore hidden order

### Dashboard/profile
- Client:
	- `GET /api/dashboard/stats`
	- `PUT /api/dashboard/profile`
- Admin:
	- `GET /api/admin/stats`
	- `GET/PUT /api/admin/profile`
	- `PUT /api/admin/password`

### Admin operations
- `GET /api/admin/clients`
- `PATCH /api/admin/clients/[id]`
- `GET/POST/PATCH /api/admin/products`
- `GET/PATCH /api/admin/stock`
- `PATCH /api/admin/stock/[variantId]`

### Delivery settings
- `GET /api/delivery-settings`
- `GET/PUT /api/admin/delivery-settings`

### Contact/inquiries
- Public:
	- `POST /api/contact`
- Admin:
	- `GET/DELETE /api/admin/contact`
	- `DELETE /api/admin/contact/[id]`
	- `POST /api/admin/contact/[id]/reply`

---

## 5) Database

## Fresh setup (destructive)
Use `scripts/schema.sql`.

It:
- Drops existing tables.
- Recreates full schema.
- Seeds categories/products/variants.
- Seeds default admin.

## Existing DB migration (safe)
Use `scripts/migrate_existing_delivery_shipping.sql`.

It:
- Preserves existing data.
- Adds missing delivery/contact/order-shipping columns and defaults.

## Important runtime schema updates
The app also performs some idempotent runtime schema checks (for backward compatibility), including delivery/contact/order UI-hide metadata columns.

---

## 6) Environment variables

Copy `.env.example` to `.env.local` and configure.

Required minimum:
- `MYSQL_HOST`
- `MYSQL_PORT`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_DATABASE`
- `JWT_SECRET`
- `NEXT_PUBLIC_BASE_URL`

Email (recommended):
- `MAIL_SERVICE=gmail`
- `MAIL_FROM=your-email@gmail.com`
- `MAIL_USER=your-email@gmail.com`
- `MAIL_PASS=<16-char-app-password>`

Optional:
- `MAIL_HOST`, `MAIL_PORT`, `MAIL_SECURE` for custom SMTP
- `CONTACT_NOTIFY_EMAIL` for contact alert destination
- `APP_BASE_URL` (explicit reset-link base URL override)
- `MYSQL_CONNECTION_LIMIT` (pool tuning)

---

## 7) Local setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

```bash
cp .env.example .env.local
```

3. Create database and import schema:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS pooja_enterprise;"
mysql -u root -p pooja_enterprise < scripts/schema.sql
```

4. Start development server:

```bash
npm run dev
```

5. Open:
- Client: `http://localhost:3000/login`
- Admin: `http://localhost:3000/admin/login`

---

## 8) Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — lint project

---

## 9) Default admin credentials (seed schema)

If you import `scripts/schema.sql`, default admin is:
- Email: `admin@poojaenterprise.com`
- Password: `admin123`

⚠️ Change this immediately in any non-local environment.

---

## 10) Deployment and ngrok notes

- Forgot-password links are generated from forwarded host/proto when available, making ngrok-compatible links possible.
- For stable external reset URLs, set `APP_BASE_URL=https://your-domain-or-ngrok-url`.

---

## 11) Data retention behavior

- **Orders**: admin remove is soft-hide (kept in DB), restorable.
- **Inquiries**: delete is permanent DB removal.

---

## 12) Troubleshooting

## Gmail `535 BadCredentials`
- Use Google App Password, not regular account password.
- Ensure 2-Step Verification is enabled.
- Set `MAIL_USER` and `MAIL_PASS` correctly.

## “Remember me” not persisting
- Client login must send `rememberMe=true`; backend sets 30-day expiry for JWT/session cookie.

## ngrok reset link not reachable
- Set `APP_BASE_URL` to your ngrok/domain, or ensure forwarded headers are present.

## Too many DB connections
- Configure `MYSQL_CONNECTION_LIMIT`; pool is singleton-based in runtime.

---

## 13) Project structure (high level)

- `app/` — pages + API routes
- `components/` — reusable UI and feature components
- `lib/` — DB access, mail service, types, validation, utilities
- `scripts/` — SQL schema/migrations and setup helpers
- `public/` — static assets

---

## 14) Security and validation highlights

- Password hashing with bcrypt.
- HTTP-only auth cookies.
- Server-side session expiry checks.
- Input sanitization for auth/profile/contact flows.
- Email/phone/GST/postal validation guards.

---

## 15) License / ownership

Internal project for Pooja Enterprise operations and B2B ordering workflows.