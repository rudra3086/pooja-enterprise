# API Documentation

Complete REST API reference for Pooja Enterprise B2B Platform.

---

## Base URL

```
http://localhost:3000/api  (Development)
https://pooja-enterprise.com/api  (Production)
```

---

## Authentication

### Cookie-Based Sessions
All authenticated endpoints use HTTP-only cookies with JWT tokens.

**Session Cookie Name**: `session_token` (clients) | `admin_session_token` (admins)

**Token Format**: JWT (HS256)

---

## Client Authentication APIs

### Register a New Client
**POST** `/auth/register`

Request:
```json
{
  "email": "buyer@company.com",
  "password": "SecurePass123!",
  "businessName": "ABC Trading Ltd",
  "contactPerson": "John Doe",
  "phone": "+91 98765 43210",
  "gstNumber": "18AAPCT1234H1Z5"
}
```

Response:
```json
{
  "success": true,
  "user": {
    "id": "client-123",
    "email": "buyer@company.com",
    "businessName": "ABC Trading Ltd",
    "contactPerson": "John Doe",
    "phone": "+91 98765 43210",
    "status": "pending"
  },
  "message": "Registration successful. Please verify your email."
}
```

Status: `201 Created` on success, `400 Bad Request` on validation failure

---

### Client Login
**POST** `/auth/login`

Request:
```json
{
  "email": "buyer@company.com",
  "password": "SecurePass123!",
  "rememberMe": true
}
```

Response:
```json
{
  "success": true,
  "user": {
    "id": "client-123",
    "email": "buyer@company.com",
    "businessName": "ABC Trading Ltd",
    "contactPerson": "John Doe",
    "status": "approved"
  },
  "message": "Login successful"
}
```

Sets HTTP-only `session_token` cookie (7 or 30 days based on `rememberMe`).

Status: `200 OK`, `401 Unauthorized`

---

### Get Current Session
**GET** `/auth/session`

Response:
```json
{
  "success": true,
  "user": {
    "id": "client-123",
    "email": "buyer@company.com",
    "businessName": "ABC Trading Ltd",
    "contactPerson": "John Doe",
    "phone": "+91 98765 43210",
    "gstNumber": "18AAPCT1234H1Z5",
    "addressLine1": "123 Business Park",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postalCode": "400001",
    "status": "approved"
  }
}
```

Status: `200 OK`, `401 Unauthorized`

---

### Logout
**POST** `/auth/logout`

Response:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

Clears `session_token` cookie.

---

### Forgot Password
**POST** `/auth/forgot-password`

Request:
```json
{
  "email": "buyer@company.com"
}
```

Response:
```json
{
  "success": true,
  "message": "If this email exists, a reset link has been sent."
}
```

Sends reset token via email.

---

### Validate Reset Token
**POST** `/auth/validate-reset-token`

Request:
```json
{
  "token": "eyJhbGc..."
}
```

Response:
```json
{
  "success": true,
  "valid": true,
  "email": "buyer@company.com"
}
```

---

### Reset Password
**POST** `/auth/reset-password`

Request:
```json
{
  "token": "eyJhbGc...",
  "newPassword": "NewSecurePass456!"
}
```

Response:
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## Catalog APIs

### Get Categories
**GET** `/categories`

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "cat-1",
      "name": "Tissue Products",
      "slug": "tissue-products",
      "description": "Premium tissue offerings",
      "imageUrl": "/images/tissue.jpg",
      "sortOrder": 1,
      "isActive": true
    }
  ]
}
```

---

### Get Products
**GET** `/products`

Query Parameters:
- `categoryId` (optional): Filter by category
- `categorySlug` (optional): Filter by slug
- `search` (optional): Search by name/description
- `featured` (optional): boolean
- `limit` (optional): Default 20
- `offset` (optional): Default 0

Response:
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "prod-1",
        "name": "Facial Tissue Roll",
        "slug": "facial-tissue-roll",
        "basePrice": 45.00,
        "imageUrl": "/images/facial-tissue.jpg",
        "isCustomizable": true,
        "categoryId": "cat-1"
      }
    ],
    "total": 42,
    "page": 1,
    "pageSize": 20,
    "totalPages": 3
  }
}
```

---

### Get Product Details
**GET** `/products/[id]`

Response includes full product details with variants:
```json
{
  "success": true,
  "data": {
    "id": "prod-1",
    "name": "Facial Tissue Roll",
    "description": "Premium soft facial tissues...",
    "basePrice": 45.00,
    "isCustomizable": true,
    "features": ["Soft", "Hypoallergenic", "Eco-friendly"],
    "variants": [
      {
        "id": "var-1",
        "sku": "FT-ROLL-2PLY",
        "name": "2-Ply Roll",
        "price": 45.00,
        "stockQuantity": 500
      }
    ]
  }
}
```

---

## Cart APIs

### Get Cart
**GET** `/cart`

Response:
```json
{
  "success": true,
  "data": {
    "id": "cart-123",
    "items": [
      {
        "id": "item-1",
        "productId": "prod-1",
        "productName": "Facial Tissue",
        "quantity": 10,
        "price": 45.00,
        "customization": {
          "logoUrl": "/uploads/logo.png",
          "positionX": 5,
          "positionY": 10,
          "additionalCost": 5.00
        }
      }
    ],
    "totalPrice": 450.00,
    "itemCount": 10
  }
}
```

---

### Add to Cart
**POST** `/cart`

Request:
```json
{
  "productId": "prod-1",
  "variantId": "var-1",
  "quantity": 10,
  "customization": {
    "logoUrl": "/uploads/logo.png",
    "positionX": 5,
    "positionY": 10,
    "additionalCost": 5.00
  }
}
```

Response: Updated cart object.

---

### Update Cart Item
**PATCH** `/cart/[itemId]`

Request:
```json
{
  "quantity": 20
}
```

---

### Remove from Cart
**DELETE** `/cart/[itemId]`

Response:
```json
{
  "success": true,
  "message": "Item removed from cart"
}
```

---

## Order APIs (Client)

### Create Order
**POST** `/orders`

Request:
```json
{
  "requiresShipping": true,
  "shippingName": "John Doe",
  "shippingPhone": "+91 98765 43210",
  "shippingAddressLine1": "123 Business Park",
  "shippingCity": "Mumbai",
  "shippingState": "Maharashtra",
  "shippingPostalCode": "400001",
  "deliveryLatitude": 19.0760,
  "deliveryLongitude": 73.0193,
  "paymentMethod": "upi",
  "customerNotes": "Please deliver before 5 PM",
  "items": [
    {
      "productId": "prod-1",
      "quantity": 10,
      "price": 45.00,
      "customization": { ... }
    }
  ]
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "order-123",
    "orderNumber": "ORD-20240407-001",
    "status": "pending",
    "paymentStatus": "pending",
    "totalAmount": 450.00,
    "createdAt": "2024-04-07T10:30:00Z"
  },
  "message": "Order placed successfully"
}
```

If `paymentMethod` is "upi", client is redirected to `/payment?amount=450.00`

---

### Get Client Orders
**GET** `/orders`

Query Parameters:
- `status` (optional): pending, confirmed, processing, shipped, delivered, cancelled
- `visibility` (optional): active, removed (default: active)
- `page` (optional): Default 1
- `pageSize` (optional): Default 10

Response:
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "order-123",
        "orderNumber": "ORD-20240407-001",
        "status": "confirmed",
        "paymentStatus": "paid",
        "totalAmount": 450.00,
        "createdAt": "2024-04-07T10:30:00Z",
        "items": [...]
      }
    ],
    "total": 5,
    "page": 1,
    "pageSize": 10,
    "totalPages": 1
  }
}
```

---

### Get Order Details
**GET** `/orders/[id]`

Response includes full order with items, shipping, and payment details.

---

## Payment APIs

### Create Payment Order
**POST** `/create-order`

Request:
```json
{
  "amount": 450.00
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "pay-123",
    "orderId": "PO1712492400ABCD",
    "amount": 450.00,
    "status": "pending"
  }
}
```

---

### Submit Payment Proof
**POST** `/submit-proof`

Content-Type: `multipart/form-data`

Form Data:
- `orderId`: Payment order ID (string)
- `utr`: Transaction reference number (string)
- `screenshot`: Image file (image/png, image/jpeg, image/webp)

Response:
```json
{
  "success": true,
  "message": "Payment proof submitted successfully"
}
```

Uploads image to `public/uploads/payment-proofs/`

Status: `201 Created`, `400 Bad Request`, `404 Not Found`

---

## Admin APIs

### Admin Login
**POST** `/admin/auth/login`

Request:
```json
{
  "email": "admin@pooja.com",
  "password": "AdminPass123!"
}
```

Sets `admin_session_token` cookie.

---

### Get Admin Orders
**GET** `/admin/orders`

Query Parameters:
- `status` (optional): Filter by order status
- `clientId` (optional): Filter by client
- `search` (optional): Search order number
- `view` (optional): active, removed (default: active)
- `page` (optional): Default 1
- `pageSize` (optional): Default 20

Response: Paginated list of orders

---

### Update Order Status
**PATCH** `/admin/orders/[id]`

Request:
```json
{
  "status": "shipped",
  "paymentStatus": "paid",
  "trackingNumber": "SHIP123456",
  "adminNotes": "Priority shipment"
}
```

Response: Updated order object

---

### Remove Order from UI
**DELETE** `/admin/orders/[id]`

Only works for `delivered` or `cancelled` orders (soft hide, not deleted).

---

### Restore Order
**POST** `/admin/orders/[id]`

Restores a hidden order to admin view.

---

### Bulk Remove Orders
**DELETE** `/admin/orders?scope=delivered|cancelled`

Removes all delivered or cancelled orders from admin UI.

---

### Get Payment Orders
**GET** `/admin/payments`

Query Parameters:
- `status` (optional): pending, verification_pending, paid, rejected

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "pay-123",
      "orderId": "PO1712492400ABCD",
      "amount": 450.00,
      "status": "verification_pending",
      "utr": "UTR123456789",
      "screenshotUrl": "/uploads/payment-proofs/...",
      "createdAt": "2024-04-07T10:30:00Z"
    }
  ]
}
```

---

### Update Payment Status
**PATCH** `/admin/payments/[orderId]`

Request:
```json
{
  "status": "paid"
}
```

Response:
```json
{
  "success": true,
  "message": "Payment marked as paid"
}
```

---

## Contact APIs

### Submit Contact Form
**POST** `/contact`

Request:
```json
{
  "name": "Jane Smith",
  "email": "jane@company.com",
  "phone": "+91 98765 43210",
  "company": "XYZ Corp",
  "subject": "Bulk Order Inquiry",
  "message": "Looking for customized tissue rolls..."
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "msg-123",
    "status": "new"
  },
  "message": "Message submitted successfully"
}
```

---

### Get Contact Messages (Admin)
**GET** `/admin/contact`

Query Parameters:
- `status` (optional): new, replied, all
- `page` (optional): Default 1
- `pageSize` (optional): Default 20

---

### Reply to Message
**POST** `/admin/contact/[id]/reply`

Request:
```json
{
  "reply": "Thank you for inquiring. Our sales team will contact you shortly..."
}
```

Sends reply via email to original inquirer.

---

## Delivery & Configuration APIs

### Get Delivery Settings
**GET** `/delivery-settings`

Response:
```json
{
  "success": true,
  "data": {
    "id": "default",
    "productionLatitude": 21.6338638,
    "productionLongitude": 73.0193249,
    "deliveryCostPerKm": 12.00
  }
}
```

---

### Update Delivery Settings (Admin)
**PATCH** `/admin/delivery-settings`

Request:
```json
{
  "productionLatitude": 21.6338638,
  "productionLongitude": 73.0193249,
  "deliveryCostPerKm": 15.00
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Descriptive error message"
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (not authenticated) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate email, etc.) |
| 500 | Server Error |

---

## Rate Limiting

No rate limiting currently implemented. Production deployment should add:
- Auth endpoints: 5 requests/minute per IP
- General endpoints: 100 requests/minute per user
- File uploads: 10 MB per request

---

## CORS

CORS is enabled for:
- `localhost:3000` (development)
- `localhost:3001` (development)
- `pooja-enterprise.com` (production)

---

## Pagination

List endpoints support pagination:

Query Parameters:
- `page`: 1-indexed page number (default: 1)
- `pageSize`: Items per page (default: 10-20)

Response includes:
```json
{
  "data": [...],
  "total": 150,
  "page": 2,
  "pageSize": 20,
  "totalPages": 8
}
```

---

## File Uploads

### Payment Screenshots
- **Endpoint**: `POST /submit-proof`
- **Field**: `screenshot`
- **Allowed Types**: image/png, image/jpeg, image/webp
- **Max Size**: ~5 MB
- **Storage**: `public/uploads/payment-proofs/`
- **URL Format**: `/uploads/payment-proofs/{orderId}-{timestamp}.{ext}`

---

## Notes

1. All timestamps are in ISO 8601 format (UTC)
2. Amounts are in INR (Indian Rupees)
3. Phone numbers should include country code (+91 for India)
4. GST numbers are validated against Indian format
5. Passwords must be at least 8 characters
6. Email validation follows RFC 5322
7. All authenticated endpoints require valid session cookie
