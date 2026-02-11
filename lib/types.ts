// Database entity types for Pooja Enterprise B2B

export interface Client {
  id: string
  email: string
  businessName: string
  contactPerson: string
  phone: string
  gstNumber?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  status: "pending" | "approved" | "suspended"
  emailVerified: boolean
  createdAt: Date
  updatedAt?: Date
}

export interface Admin {
  id: string
  email: string
  name: string
  phone?: string
  role: "super_admin" | "admin" | "manager"
  avatarUrl?: string
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt?: Date
}

export interface Session {
  id: string
  userId: string
  userType: "client" | "admin"
  token: string
  expiresAt: Date
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  imageUrl?: string
  sortOrder?: number
  isActive: boolean
}

export interface CustomizationOptions {
  sizes?: string[]
  colors?: string[]
  ply?: string[]
  sheets?: string[]
  printing?: boolean
  embossing?: boolean
}

export interface Product {
  id: string
  categoryId: string
  name: string
  slug: string
  description?: string
  shortDescription?: string
  basePrice: number
  minOrderQuantity: number
  imageUrl?: string
  galleryUrls?: string[]
  features?: string[]
  specifications?: Record<string, string>
  isCustomizable: boolean
  customizationOptions?: CustomizationOptions | null
  isActive: boolean
  isFeatured: boolean
  metaTitle?: string
  metaDescription?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface ProductVariant {
  id: string
  productId: string
  sku: string
  name: string
  size?: string
  color?: string
  ply?: string
  thickness?: string
  width?: string
  price: number
  stockQuantity: number
  lowStockThreshold?: number
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface Customization {
  size?: string
  color?: string
  ply?: string
  printing?: {
    enabled: boolean
    text?: string
    logo?: string
  }
  embossing?: boolean
}

export interface CartItem {
  id: string
  cartId: string
  productId: string
  variantId?: string
  quantity: number
  customization?: Customization
  product?: Product
  variant?: ProductVariant
  createdAt?: Date
  updatedAt?: Date
}

export interface Cart {
  id: string
  clientId: string
  items: CartItem[]
  createdAt?: Date
  updatedAt?: Date
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  variantId?: string
  productName: string
  variantName?: string
  sku?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  customization?: Customization
  createdAt?: Date
}

export interface Order {
  id: string
  clientId: string
  orderNumber: string
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
  paymentStatus: "pending" | "paid" | "failed" | "refunded"
  paymentMethod: "bank_transfer" | "upi" | "credit_terms"
  subtotal: number
  taxAmount: number
  shippingAmount: number
  discountAmount: number
  totalAmount: number
  shippingName: string
  shippingPhone: string
  shippingAddressLine1: string
  shippingAddressLine2?: string
  shippingCity: string
  shippingState: string
  shippingPostalCode: string
  shippingCountry: string
  customerNotes?: string
  adminNotes?: string
  trackingNumber?: string
  shippedAt?: Date
  deliveredAt?: Date
  items?: OrderItem[]
  client?: Client
  createdAt: Date
  updatedAt?: Date
}

// API Request/Response types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  businessName: string
  contactPerson: string
  phone: string
  gstNumber?: string
}

export interface AuthResponse {
  success: boolean
  message?: string
  user?: Client | Admin
  token?: string
}

export interface AddToCartRequest {
  productId: string
  variantId?: string
  quantity: number
  customization?: Customization
}

export interface CreateOrderRequest {
  shippingName: string
  shippingPhone: string
  shippingAddressLine1: string
  shippingAddressLine2?: string
  shippingCity: string
  shippingState: string
  shippingPostalCode: string
  paymentMethod: "bank_transfer" | "upi" | "credit_terms"
  customerNotes?: string
}

export interface UpdateOrderStatusRequest {
  status?: Order["status"]
  paymentStatus?: Order["paymentStatus"]
  trackingNumber?: string
  adminNotes?: string
}

export interface UpdateStockRequest {
  variantId: string
  quantity: number
  operation: "set" | "add" | "subtract"
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
