# Technologies & Tech Stack

Complete list of all technologies, libraries, and packages used in Pooja Enterprise.

---

## Language & Runtime

### JavaScript/TypeScript
- **TypeScript 5.x** — Type-safe JavaScript for larger projects
  - Located: Root `tsconfig.json`
  - Strict mode enabled
  - Runtime: Node.js with tsx for scripts

---

## Frontend Framework

### Next.js 14
- **Version**: 14.x
- **Purpose**: React-based full-stack framework
- **Features Used**:
  - App Router (new routing system)
  - API Routes under `app/api/`
  - Middleware for auth
  - Image optimization
  - CSS support
- **Config**: `next.config.mjs`

### React 18
- **Version**: 18.x
- **Purpose**: UI component library
- **Hooks**: useState, useEffect, useContext, useCallback, useRef
- **Dependencies**:
  - react-dom (18.x) — DOM rendering

---

## Styling & CSS

### Tailwind CSS 4.1.9
- **Purpose**: Utility-first CSS framework
- **Config**: `tailwind.config.ts`
- **Usage**: Class-based styling (e.g., `className="flex items-center"`)
- **Features**:
  - Responsive design (@media breakpoints)
  - Dark mode support (class-based)
  - Custom color schemes
  - Animation utilities

### PostCSS 8.x
- **Purpose**: CSS plugin processor
- **Config**: `postcss.config.mjs`
- **Plugins**: Tailwind CSS plugin

### CSS Modules
- Used for component-scoped styles
- Pattern: `component.module.css`

---

## UI Component Library

### Radix UI
- **Version**: 1.x
- **Purpose**: Unstyled, accessible component library
- **Components Used**:
  - Dialog/Modal
  - Dropdown Menu
  - Tabs
  - Accordion
  - Hover Card
  - Context Menu
  - Select
  - Carousel
  - Command
  - Popover
  - Toggle Group
  - Sheet
  - Alert Dialog
  - And 20+ more...
- **Installation**: Individual package imports (e.g., `@radix-ui/react-dialog`)

---

## Database

### MySQL 8.x
- **Purpose**: Relational database for persistent storage
- **Schema**: Auto-created on first run (via `lib/db.ts`)
- **Tables**: 13 total (clients, products, orders, payments, etc.)
- **Indexes**: Strategic indexing on ForeignKeys, status fields, timestamps

### mysql2 3.16.2
- **Purpose**: Node.js MySQL driver
- **Features**: Connection pooling, promise-based API
- **Config**:
  ```javascript
  {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  }
  ```

---

## Authentication & Security

### Bcryptjs 2.4.3
- **Purpose**: Password hashing
- **Uses**: 12 salt rounds for secure hashing
- **When**: User registration and password reset
- **Example**:
  ```typescript
  const hashedPassword = await bcrypt.hash(plainPassword, 12)
  const isMatch = await bcrypt.compare(plainPassword, hash)
  ```

### jsonwebtoken 9.x
- **Purpose**: JSON Web Tokens for session management
- **Uses**: Generate and verify JWT tokens
- **Secret**: Stored in `process.env.JWT_SECRET`
- **Payload**: User ID, user type (client/admin), issued time
- **Expiration**: 7 or 30 days

### Zod 3.25.76
- **Purpose**: TypeScript-first schema validation
- **Uses**: Validate request bodies, form inputs, API parameters
- **Example**:
  ```typescript
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8)
  })
  ```

---

## Maps & Geolocation

### Leaflet 1.9.4
- **Purpose**: Interactive web maps
- **Features**: 
  - Display map tiles (OpenStreetMap)
  - Markers and popups
  - Map controls (zoom, fullscreen)
- **Uses**: Delivery location selection

### React-Leaflet 4.2.1
- **Purpose**: React wrapper for Leaflet
- **Components**: `<MapContainer>`, `<TileLayer>`, `<Marker>`, `<Popup>`
- **Usage**: In `components/map/location-picker.tsx`

---

## File Handling & QR Codes

### qrcode 1.5.4
- **Purpose**: Generate QR codes
- **Uses**: Originally used for dynamic UPI QR generation
- **Current**: Deprecated (using static QR image instead)

### @types/qrcode 1.5.6
- **Purpose**: TypeScript type definitions for qrcode
- **Dev Dependency**: Installed for type safety

### fs-extra or fs/promises
- **Purpose**: File system operations
- **Uses**: 
  - Read/write uploaded payment screenshots
  - Store in `public/uploads/payment-proofs/`
- **No external dependency**: Uses Node.js built-in `fs/promises`

---

## Email & Communication

### Nodemailer 8.0.1
- **Purpose**: Send transactional emails
- **Transport**: Gmail (SMTP)
- **Config**:
  ```javascript
  {
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD // App-specific password
    }
  }
  ```
- **Uses**:
  - Password reset emails
  - Contact form replies
  - Order confirmations (optional)
- **Templates**: Stored in `lib/mail.ts`

---

## Animations & Transitions

### Framer Motion 12.29.2
- **Purpose**: Declarative animations and transitions
- **Uses**:
  - Page transitions
  - Component animations
  - Hover effects
  - SVG animations
- **Components**: `<motion.div>`, `<AnimatePresence>`, `<motion.*>`

### GSAP (GreenSock Animation Platform) 3.14.2
- **Purpose**: Advanced JavaScript animation library
- **Uses**: Complex, chained animations
- **Features**: Tweens, timelines, easing functions

---

## Icons

### Lucide React 0.454.0
- **Purpose**: SVG icon library
- **Icons Used**:
  - Navigation: home, menu, user, shopping-cart, settings
  - Status: check-circle, alert-circle, clock
  - Actions: edit, trash, download, upload
  - Business: credit-card, truck, package
- **Usage**: `<Icon name="..." />`

---

## Notification & Toast UI

### Sonner 1.x
- **Purpose**: Toast/notification library
- **Features**:
  - Success, error, loading, custom toasts
  - Non-intrusive positioning
  - Auto-dismiss after 4 seconds
- **Setup**: `components/ui/sonner.tsx`
- **Usage**: `toast.success("Order placed!")` or `toast.error("Try again")`

---

## State Management

### React Context API (Built-in)
- **Purpose**: Client-side state management
- **Uses**:
  - Cart context (`lib/cart-context.tsx`)
  - Theme context (`components/theme-provider.tsx`)
  - AI context (`lib/ai-context.ts`)
- **Alternative to**: Redux, Zustand (simpler, no extra dependency)

### URL Query Parameters
- **Purpose**: Lightweight state persistence
- **Uses**: Payment amount (`/payment?amount=500`)
- **Library**: `next/navigation` (useSearchParams hook)

---

## Validation & Formatting

### Zod 3.25.76
- Already listed above under Authentication

### clsx or classnames
- **Purpose**: Conditional className combining
- **Usage**: 
  ```typescript
  className={clsx(
    "base-class",
    isActive && "active-class",
    size === "lg" && "lg-class"
  )}
  ```

---

## Charting & Data Visualization

### Recharts 2.x (if used)
- **Purpose**: React charting library
- **Components**: LineChart, BarChart, PieChart
- **Uses**: Admin dashboard statistics (sales, orders, revenue)

---

## Development Tools

### TypeScript 5.x
- **Config**: `tsconfig.json`
- **Features**: Type checking, interfaces, enums

### ESLint
- **Purpose**: Code linting
- **Config**: `.eslintrc.json` or `eslint.config.js`

### Prettier
- **Purpose**: Code formatting
- **Config**: `.prettierrc`

### PostCSS 8.x
- Already listed above

---

## Package Management

### npm 10.x
- **Purpose**: JavaScript package manager
- **Lock File**: `package-lock.json` (ensures reproducible installs)
- **Key Commands**:
  ```bash
  npm install              # Install dependencies
  npm run dev              # Start dev server
  npm run build            # Production build
  npm run lint             # Run ESLint
  npm start                # Start production server
  ```

---

## Environment Configuration

### .env.local
- **Purpose**: Local environment variables (not committed)
- **Variables**:
  ```
  NEXT_PUBLIC_API_URL=http://localhost:3000
  
  # MySQL
  MYSQL_HOST=localhost
  MYSQL_USER=root
  MYSQL_PASSWORD=password
  MYSQL_DB=pooja_enterprise
  
  # JWT
  JWT_SECRET=your-secret-key-here
  
  # Email
  GMAIL_USER=your-email@gmail.com
  GMAIL_PASSWORD=your-app-password
  
  # Geolocation (Delivery)
  NEXT_PUBLIC_MAPBOX_TOKEN=your-token (optional)
  ```

### process.env
- **Access**: `process.env.VARIABLE_NAME`
- **Client-side**: Only `NEXT_PUBLIC_*` variables accessible
- **Server-side**: All variables accessible

---

## Deployment

### Node.js
- **Version**: 16.x, 18.x, or 20.x (LTS)
- **Purpose**: Runtime for Next.js server

### Docker (Optional)
- **Dockerfile**: Could be added for containerization
- **Purpose**: Consistent deployment across environments

### Environment: Vercel.com
- **Native Support**: Next.js apps deploy directly
- **Free Tier**: Sufficient for development/demo
- **Auto-deploy**: From Git push

---

## Comparison: Why These Technologies?

| Technology | Why Chosen | Alternatives |
|-----------|-----------|--------------|
| Next.js 14 | Full-stack React framework, built-in API routes | Remix, SvelteKit, Express + React |
| TypeScript | Type safety, better IDE support | JavaScript + JSDoc |
| Tailwind CSS | Rapid UI development, small bundle size | Bootstrap, Material-UI, CSS-in-JS |
| Radix UI | Headless components, full control | Material-UI, shadcn/ui, Ant Design |
| MySQL | Relational data, ACID transactions | PostgreSQL, MongoDB, Firebase |
| Zod | TypeScript-first validation | Joi, Yup, io-ts |
| Leaflet | Lightweight map library | Google Maps, Mapbox |
| Framer Motion | Smooth animations, React-native | React Spring, Motion |
| Bcryptjs | Password hashing benchmark | Argon2, PBKDF2 |

---

## Package Dependencies Summary

### Production Dependencies
```json
{
  "next": "14.x",
  "react": "18.x",
  "react-dom": "18.x",
  "typescript": "5.x",
  "@radix-ui/*": "latest",
  "tailwindcss": "4.1.9",
  "postcss": "8.x",
  "mysql2": "3.16.2",
  "jsonwebtoken": "9.x",
  "bcryptjs": "2.4.3",
  "zod": "3.25.76",
  "nodemailer": "8.0.1",
  "framer-motion": "12.29.2",
  "gsap": "3.14.2",
  "lucide-react": "0.454.0",
  "leaflet": "1.9.4",
  "react-leaflet": "4.2.1",
  "qrcode": "1.5.4",
  "sonner": "1.x",
  "clsx": "2.x"
}
```

### Dev Dependencies
```json
{
  "@types/node": "latest",
  "@types/react": "latest",
  "@types/react-dom": "latest",
  "@types/qrcode": "1.5.6",
  "tailwindcss": "4.1.9",
  "postcss": "8.x",
  "eslint": "latest",
  "prettier": "latest"
}
```

---

## Version Management

**Update Strategy**:
- Use `npm update` for patch/minor version updates
- Lock major versions in `package.json` using `^` or `~`
- Test thoroughly before major version updates

**Current Node Version**: 16.x or higher (check with `node --version`)

---

## Performance Metrics

**Build Time**: ~60 seconds (production build)
**Bundle Size**: ~800 KB (gzipped, optimized)
**LCP** (Largest Contentful Paint): <2.5s
**FID** (First Input Delay): <100ms

---

## Security Best Practices with Tech Stack

1. **Passwords**: Bcryptjs prevents brute-force attacks
2. **Tokens**: JWT with secret key stored in env vars
3. **Database**: Parameterized queries prevent SQL injection
4. **HTTPS**: Required in production
5. **Input Validation**: Zod validates all inputs before processing
6. **File Uploads**: Whitelist only image types, store securely
7. **Environment Variables**: Never commit `.env.local`
8. **CORS**: Restrict to trusted domains in production

---

## Future Technology Improvements

1. **PostgreSQL**: Better for complex queries (over MySQL)
2. **Redis**: Caching for performance
3. **Stripe/Razorpay**: Real payment gateway (over UPI proof)
4. **AWS S3**: Cloud file storage (over local filesystem)
5. **Sentry**: Error tracking and monitoring
6. **GitHub Actions**: CI/CD automation
7. **Docker**: Containerization for consistent deployments
8. **Kubernetes**: Orchestration for scaling

---

## Quick Reference

| Need | Technology | Package |
|------|-----------|---------|
| Build Web App | Next.js 14 | `next` |
| Types | TypeScript | `typescript` |
| Styling | Tailwind CSS | `tailwindcss` |
| Components | Radix UI | `@radix-ui/*` |
| Database | MySQL 8 | `mysql2` |
| Auth | JWT + Bcryptjs | `jsonwebtoken`, `bcryptjs` |
| Validation | Zod | `zod` |
| Maps | Leaflet | `leaflet`, `react-leaflet` |
| Animations | Framer Motion | `framer-motion` |
| Icons | Lucide React | `lucide-react` |
| Notifications | Sonner | `sonner` |
| Email | Nodemailer | `nodemailer` |
