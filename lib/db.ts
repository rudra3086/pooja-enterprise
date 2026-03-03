// Database utility for MySQL connection
import mysql, { Pool, PoolConnection, RowDataPacket, ResultSetHeader } from "mysql2/promise"
import { 
  Client, 
  Admin, 
  Product, 
  ProductVariant, 
  Category, 
  Order, 
  OrderItem, 
  CartItem,
  Cart,
  Session,
  DeliverySettings,
  ContactMessage
} from "@/lib/types"

declare global {
  var __poojaMysqlPool: Pool | undefined
}

// Create/reuse a single connection pool (important for Next.js dev hot reload)
const pool: Pool = global.__poojaMysqlPool ?? mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  port: parseInt(process.env.MYSQL_PORT || "3306"),
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "pooja_enterprise",
  waitForConnections: true,
  connectionLimit: parseInt(process.env.MYSQL_CONNECTION_LIMIT || "10"),
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
})

if (!global.__poojaMysqlPool) {
  global.__poojaMysqlPool = pool
}

// Helper to execute queries
export async function query<T extends RowDataPacket[]>(
  sql: string, 
  params?: (string | number | boolean | null | Date | undefined)[]
): Promise<T> {
  const [rows] = await pool.execute<T>(sql, params)
  return rows
}

// Helper to execute mutations (INSERT, UPDATE, DELETE)
export async function execute(
  sql: string, 
  params?: (string | number | boolean | null | Date | undefined)[]
): Promise<ResultSetHeader> {
  const [result] = await pool.execute<ResultSetHeader>(sql, params)
  return result
}

// Get a connection for transactions
export async function getConnection(): Promise<PoolConnection> {
  return await pool.getConnection()
}

// =====================================================
// CATEGORY FUNCTIONS
// =====================================================

export async function getCategories(): Promise<Category[]> {
  const rows = await query<RowDataPacket[]>(
    `SELECT id, name, slug, description, image_url as imageUrl, sort_order as sortOrder, is_active as isActive 
     FROM categories 
     WHERE is_active = TRUE 
     ORDER BY sort_order ASC`
  )
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    imageUrl: row.imageUrl,
    sortOrder: row.sortOrder,
    isActive: Boolean(row.isActive),
  }))
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const rows = await query<RowDataPacket[]>(
    `SELECT id, name, slug, description, image_url as imageUrl, sort_order as sortOrder, is_active as isActive 
     FROM categories 
     WHERE slug = ? AND is_active = TRUE`,
    [slug]
  )
  if (rows.length === 0) return null
  const row = rows[0]
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    imageUrl: row.imageUrl,
    sortOrder: row.sortOrder,
    isActive: Boolean(row.isActive),
  }
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const rows = await query<RowDataPacket[]>(
    `SELECT id, name, slug, description, image_url as imageUrl, sort_order as sortOrder, is_active as isActive 
     FROM categories 
     WHERE id = ?`,
    [id]
  )
  if (rows.length === 0) return null
  const row = rows[0]
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    imageUrl: row.imageUrl,
    sortOrder: row.sortOrder,
    isActive: Boolean(row.isActive),
  }
}

// =====================================================
// PRODUCT FUNCTIONS
// =====================================================

export async function getProducts(options?: {
  categoryId?: string
  categorySlug?: string
  search?: string
  featured?: boolean
  limit?: number
  offset?: number
}): Promise<{ products: Product[]; total: number }> {
  let whereClause = "WHERE p.is_active = TRUE"
  const params: (string | number | boolean)[] = []

  if (options?.categoryId) {
    whereClause += " AND p.category_id = ?"
    params.push(options.categoryId)
  }

  if (options?.categorySlug) {
    whereClause += " AND c.slug = ?"
    params.push(options.categorySlug)
  }

  if (options?.search) {
    whereClause += " AND (p.name LIKE ? OR p.description LIKE ? OR p.short_description LIKE ?)"
    const searchTerm = `%${options.search}%`
    params.push(searchTerm, searchTerm, searchTerm)
  }

  if (options?.featured) {
    whereClause += " AND p.is_featured = TRUE"
  }

  // Get total count
  const countRows = await query<RowDataPacket[]>(
    `SELECT COUNT(*) as total FROM products p 
     LEFT JOIN categories c ON p.category_id = c.id 
     ${whereClause}`,
    params
  )
  const total = countRows[0].total

  // Get products with pagination
  let sql = `
    SELECT 
      p.id, p.category_id as categoryId, p.name, p.slug, p.description, 
      p.short_description as shortDescription, p.base_price as basePrice, 
      p.min_order_quantity as minOrderQuantity, p.image_url as imageUrl, 
      p.gallery_urls as galleryUrls, p.features, p.specifications,
      p.is_customizable as isCustomizable, p.customization_options as customizationOptions,
      p.is_active as isActive, p.is_featured as isFeatured,
      p.meta_title as metaTitle, p.meta_description as metaDescription,
      p.created_at as createdAt, p.updated_at as updatedAt
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ${whereClause}
    ORDER BY p.is_featured DESC, p.created_at DESC
  `

  if (options?.limit) {
    sql += ` LIMIT ${options.limit}`
    if (options?.offset) {
      sql += ` OFFSET ${options.offset}`
    }
  }

  const rows = await query<RowDataPacket[]>(sql, params)
  
  // Helper function to safely parse JSON fields
  const safeJsonParse = (value: any, fieldName: string) => {
    if (!value) return undefined
    try {
      // If it's already an object, return it as-is
      if (typeof value === 'object') return value
      return JSON.parse(value)
    } catch (e) {
      console.error(`Failed to parse ${fieldName}:`, value)
      console.error('Parse error:', e)
      return undefined
    }
  }
  
  const products: Product[] = rows.map(row => ({
    id: row.id,
    categoryId: row.categoryId,
    name: row.name,
    slug: row.slug,
    description: row.description,
    shortDescription: row.shortDescription,
    basePrice: parseFloat(row.basePrice),
    minOrderQuantity: row.minOrderQuantity,
    imageUrl: row.imageUrl,
    galleryUrls: safeJsonParse(row.galleryUrls, 'galleryUrls'),
    features: safeJsonParse(row.features, 'features'),
    specifications: safeJsonParse(row.specifications, 'specifications'),
    isCustomizable: Boolean(row.isCustomizable),
    customizationOptions: safeJsonParse(row.customizationOptions, 'customizationOptions'),
    isActive: Boolean(row.isActive),
    isFeatured: Boolean(row.isFeatured),
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }))

  return { products, total }
}

export async function getAllProductsForAdmin(): Promise<Product[]> {
  const rows = await query<RowDataPacket[]>(
    `SELECT 
      id, category_id as categoryId, name, slug, description, 
      short_description as shortDescription, base_price as basePrice, 
      min_order_quantity as minOrderQuantity, image_url as imageUrl, 
      is_customizable as isCustomizable, customization_options as customizationOptions,
      is_active as isActive, is_featured as isFeatured,
      created_at as createdAt, updated_at as updatedAt
    FROM products 
    ORDER BY name ASC`
  )
  
  const safeJsonParse = (value: any) => {
    if (!value) return undefined
    try {
      if (typeof value === 'object') return value
      return JSON.parse(value)
    } catch (e) {
      return undefined
    }
  }
  
  return rows.map(row => ({
    id: row.id,
    categoryId: row.categoryId,
    name: row.name,
    slug: row.slug,
    description: row.description,
    shortDescription: row.shortDescription,
    basePrice: parseFloat(row.basePrice),
    minOrderQuantity: row.minOrderQuantity,
    imageUrl: row.imageUrl,
    isCustomizable: Boolean(row.isCustomizable),
    customizationOptions: safeJsonParse(row.customizationOptions),
    isActive: Boolean(row.isActive),
    isFeatured: Boolean(row.isFeatured),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }))
}

export async function getProductById(id: string): Promise<Product | null> {
  const rows = await query<RowDataPacket[]>(
    `SELECT 
      id, category_id as categoryId, name, slug, description, 
      short_description as shortDescription, base_price as basePrice, 
      min_order_quantity as minOrderQuantity, image_url as imageUrl, 
      gallery_urls as galleryUrls, features, specifications,
      is_customizable as isCustomizable, customization_options as customizationOptions,
      is_active as isActive, is_featured as isFeatured,
      meta_title as metaTitle, meta_description as metaDescription,
      created_at as createdAt, updated_at as updatedAt
    FROM products 
    WHERE id = ?`,
    [id]
  )
  if (rows.length === 0) return null
  const row = rows[0]
  
  // Helper to safely parse JSON
  const safeJsonParse = (value: any, fieldName: string) => {
    if (!value) return undefined
    try {
      // If it's already parsed (object/array), return it
      if (typeof value === 'object') return value
      // If it's a string, try to parse it
      return JSON.parse(value)
    } catch (e) {
      console.error(`Failed to parse ${fieldName}:`, value)
      console.error('Parse error:', e)
      return undefined
    }
  }
  
  return {
    id: row.id,
    categoryId: row.categoryId,
    name: row.name,
    slug: row.slug,
    description: row.description,
    shortDescription: row.shortDescription,
    basePrice: parseFloat(row.basePrice),
    minOrderQuantity: row.minOrderQuantity,
    imageUrl: row.imageUrl,
    galleryUrls: safeJsonParse(row.galleryUrls, 'galleryUrls'),
    features: safeJsonParse(row.features, 'features'),
    specifications: safeJsonParse(row.specifications, 'specifications'),
    isCustomizable: Boolean(row.isCustomizable),
    customizationOptions: safeJsonParse(row.customizationOptions, 'customizationOptions'),
    isActive: Boolean(row.isActive),
    isFeatured: Boolean(row.isFeatured),
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const rows = await query<RowDataPacket[]>(
    `SELECT 
      id, category_id as categoryId, name, slug, description, 
      short_description as shortDescription, base_price as basePrice, 
      min_order_quantity as minOrderQuantity, image_url as imageUrl, 
      gallery_urls as galleryUrls, features, specifications,
      is_customizable as isCustomizable, customization_options as customizationOptions,
      is_active as isActive, is_featured as isFeatured,
      meta_title as metaTitle, meta_description as metaDescription,
      created_at as createdAt, updated_at as updatedAt
    FROM products 
    WHERE slug = ? AND is_active = TRUE`,
    [slug]
  )
  if (rows.length === 0) return null
  const row = rows[0]
  
  // Helper function to safely parse JSON fields
  const safeJsonParse = (value: any, fieldName: string) => {
    if (!value) return undefined
    try {
      // If it's already an object, return it as-is
      if (typeof value === 'object') return value
      return JSON.parse(value)
    } catch (e) {
      console.error(`Failed to parse ${fieldName}:`, value)
      console.error('Parse error:', e)
      return undefined
    }
  }
  
  return {
    id: row.id,
    categoryId: row.categoryId,
    name: row.name,
    slug: row.slug,
    description: row.description,
    shortDescription: row.shortDescription,
    basePrice: parseFloat(row.basePrice),
    minOrderQuantity: row.minOrderQuantity,
    imageUrl: row.imageUrl,
    galleryUrls: safeJsonParse(row.galleryUrls, 'galleryUrls'),
    features: safeJsonParse(row.features, 'features'),
    specifications: safeJsonParse(row.specifications, 'specifications'),
    isCustomizable: Boolean(row.isCustomizable),
    customizationOptions: safeJsonParse(row.customizationOptions, 'customizationOptions'),
    isActive: Boolean(row.isActive),
    isFeatured: Boolean(row.isFeatured),
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

// =====================================================
// PRODUCT VARIANT FUNCTIONS
// =====================================================

export async function getProductVariants(productId: string): Promise<ProductVariant[]> {
  const rows = await query<RowDataPacket[]>(
    `SELECT 
      id, product_id as productId, sku, name, size, color, ply, thickness, width,
      price, stock_quantity as stockQuantity, low_stock_threshold as lowStockThreshold,
      is_active as isActive, created_at as createdAt, updated_at as updatedAt
    FROM product_variants 
    WHERE product_id = ? AND is_active = TRUE
    ORDER BY price ASC`,
    [productId]
  )
  return rows.map(row => ({
    id: row.id,
    productId: row.productId,
    sku: row.sku,
    name: row.name,
    size: row.size,
    color: row.color,
    ply: row.ply,
    thickness: row.thickness,
    width: row.width,
    price: parseFloat(row.price),
    stockQuantity: row.stockQuantity,
    lowStockThreshold: row.lowStockThreshold,
    isActive: Boolean(row.isActive),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }))
}

export async function getVariantById(id: string): Promise<ProductVariant | null> {
  const rows = await query<RowDataPacket[]>(
    `SELECT 
      id, product_id as productId, sku, name, size, color, ply, thickness, width,
      price, stock_quantity as stockQuantity, low_stock_threshold as lowStockThreshold,
      is_active as isActive, created_at as createdAt, updated_at as updatedAt
    FROM product_variants 
    WHERE id = ?`,
    [id]
  )
  if (rows.length === 0) return null
  const row = rows[0]
  return {
    id: row.id,
    productId: row.productId,
    sku: row.sku,
    name: row.name,
    size: row.size,
    color: row.color,
    ply: row.ply,
    thickness: row.thickness,
    width: row.width,
    price: parseFloat(row.price),
    stockQuantity: row.stockQuantity,
    lowStockThreshold: row.lowStockThreshold,
    isActive: Boolean(row.isActive),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export async function getAllVariants(options?: {
  productId?: string
  lowStock?: boolean
  search?: string
  limit?: number
  offset?: number
}): Promise<{ variants: (ProductVariant & { productName: string; categoryId: string })[]; total: number }> {
  let whereClause = "WHERE 1=1"
  const params: (string | number)[] = []

  if (options?.productId) {
    whereClause += " AND pv.product_id = ?"
    params.push(options.productId)
  }

  if (options?.lowStock) {
    whereClause += " AND pv.stock_quantity <= pv.low_stock_threshold"
  }

  if (options?.search) {
    whereClause += " AND (pv.sku LIKE ? OR pv.name LIKE ?)"
    const searchTerm = `%${options.search}%`
    params.push(searchTerm, searchTerm)
  }

  const countRows = await query<RowDataPacket[]>(
    `SELECT COUNT(*) as total 
     FROM product_variants pv
     LEFT JOIN products p ON pv.product_id = p.id
     ${whereClause}`,
    params
  )
  const total = countRows[0].total

  let sql = `
    SELECT 
      pv.id, pv.product_id as productId, pv.sku, pv.name, pv.size, pv.color, 
      pv.ply, pv.thickness, pv.width, pv.price, pv.stock_quantity as stockQuantity, 
      pv.low_stock_threshold as lowStockThreshold, pv.is_active as isActive,
      pv.created_at as createdAt, pv.updated_at as updatedAt,
      p.name as productName, p.category_id as categoryId, p.image_url as imageUrl
    FROM product_variants pv
    LEFT JOIN products p ON pv.product_id = p.id
    ${whereClause}
    ORDER BY pv.stock_quantity ASC
  `

  if (options?.limit) {
    sql += ` LIMIT ${options.limit}`
    if (options?.offset) {
      sql += ` OFFSET ${options.offset}`
    }
  }

  const rows = await query<RowDataPacket[]>(sql, params)
  
  const variants = rows.map(row => ({
    id: row.id,
    productId: row.productId,
    sku: row.sku,
    name: row.name,
    size: row.size,
    color: row.color,
    ply: row.ply,
    thickness: row.thickness,
    width: row.width,
    price: parseFloat(row.price),
    stockQuantity: row.stockQuantity,
    lowStockThreshold: row.lowStockThreshold,
    isActive: Boolean(row.isActive),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    productName: row.productName,
    categoryId: row.categoryId,
    imageUrl: row.imageUrl,
  }))

  return { variants, total }
}

export async function updateVariantStock(
  variantId: string, 
  quantity: number, 
  operation: "set" | "add" | "subtract"
): Promise<boolean> {
  let sql: string
  switch (operation) {
    case "set":
      sql = "UPDATE product_variants SET stock_quantity = ? WHERE id = ?"
      break
    case "add":
      sql = "UPDATE product_variants SET stock_quantity = stock_quantity + ? WHERE id = ?"
      break
    case "subtract":
      sql = "UPDATE product_variants SET stock_quantity = GREATEST(0, stock_quantity - ?) WHERE id = ?"
      break
  }
  const result = await execute(sql, [quantity, variantId])
  return result.affectedRows > 0
}

export async function updateVariantDetails(
  variantId: string,
  updates: {
    price?: number
    lowStockThreshold?: number
  }
): Promise<boolean> {
  const fields: string[] = []
  const values: any[] = []

  if (updates.price !== undefined) {
    fields.push("price = ?")
    values.push(updates.price)
  }

  if (updates.lowStockThreshold !== undefined) {
    fields.push("low_stock_threshold = ?")
    values.push(updates.lowStockThreshold)
  }

  if (fields.length === 0) return true

  values.push(variantId)
  const sql = `UPDATE product_variants SET ${fields.join(", ")} WHERE id = ?`
  const result = await execute(sql, values)
  return result.affectedRows > 0
}

export async function updateProduct(
  productId: string,
  updates: {
    name?: string
    description?: string
    shortDescription?: string
    basePrice?: number
    minOrderQuantity?: number
    imageUrl?: string
    isActive?: boolean
    isFeatured?: boolean
    isCustomizable?: boolean
    customizationOptions?: any
  }
): Promise<boolean> {
  const fields: string[] = []
  const values: any[] = []

  if (updates.name !== undefined) {
    fields.push("name = ?")
    values.push(updates.name)
  }
  if (updates.description !== undefined) {
    fields.push("description = ?")
    values.push(updates.description)
  }
  if (updates.shortDescription !== undefined) {
    fields.push("short_description = ?")
    values.push(updates.shortDescription)
  }
  if (updates.basePrice !== undefined) {
    fields.push("base_price = ?")
    values.push(updates.basePrice)
  }
  if (updates.minOrderQuantity !== undefined) {
    fields.push("min_order_quantity = ?")
    values.push(updates.minOrderQuantity)
  }
  if (updates.imageUrl !== undefined) {
    fields.push("image_url = ?")
    values.push(updates.imageUrl)
  }
  if (updates.isActive !== undefined) {
    fields.push("is_active = ?")
    values.push(updates.isActive)
  }
  if (updates.isFeatured !== undefined) {
    fields.push("is_featured = ?")
    values.push(updates.isFeatured)
  }
  if (updates.isCustomizable !== undefined) {
    fields.push("is_customizable = ?")
    values.push(updates.isCustomizable)
  }
  if (updates.customizationOptions !== undefined) {
    fields.push("customization_options = ?")
    values.push(JSON.stringify(updates.customizationOptions))
  }

  if (fields.length === 0) return true

  fields.push("updated_at = NOW()")
  values.push(productId)
  const sql = `UPDATE products SET ${fields.join(", ")} WHERE id = ?`
  const result = await execute(sql, values)
  return result.affectedRows > 0
}

// =====================================================
// CLIENT FUNCTIONS
// =====================================================

export async function getClientByEmail(email: string): Promise<(Client & { passwordHash: string }) | null> {
  const rows = await query<RowDataPacket[]>(
    `SELECT 
      id, email, password_hash as passwordHash, business_name as businessName, 
      contact_person as contactPerson, phone, gst_number as gstNumber,
      address_line1 as addressLine1, address_line2 as addressLine2, city, state, 
      postal_code as postalCode, country, status, email_verified as emailVerified,
      created_at as createdAt, updated_at as updatedAt
    FROM clients 
    WHERE email = ?`,
    [email]
  )
  if (rows.length === 0) return null
  const row = rows[0]
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.passwordHash,
    businessName: row.businessName,
    contactPerson: row.contactPerson,
    phone: row.phone,
    gstNumber: row.gstNumber,
    addressLine1: row.addressLine1,
    addressLine2: row.addressLine2,
    city: row.city,
    state: row.state,
    postalCode: row.postalCode,
    country: row.country,
    status: row.status,
    emailVerified: Boolean(row.emailVerified),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export async function getClientById(id: string): Promise<Client | null> {
  const rows = await query<RowDataPacket[]>(
    `SELECT 
      id, email, business_name as businessName, contact_person as contactPerson, 
      phone, gst_number as gstNumber, address_line1 as addressLine1, 
      address_line2 as addressLine2, city, state, postal_code as postalCode, 
      country, status, email_verified as emailVerified,
      created_at as createdAt, updated_at as updatedAt
    FROM clients 
    WHERE id = ?`,
    [id]
  )
  if (rows.length === 0) return null
  const row = rows[0]
  return {
    id: row.id,
    email: row.email,
    businessName: row.businessName,
    contactPerson: row.contactPerson,
    phone: row.phone,
    gstNumber: row.gstNumber,
    addressLine1: row.addressLine1,
    addressLine2: row.addressLine2,
    city: row.city,
    state: row.state,
    postalCode: row.postalCode,
    country: row.country,
    status: row.status,
    emailVerified: Boolean(row.emailVerified),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export async function getClients(options?: {
  status?: string
  search?: string
  limit?: number
  offset?: number
}): Promise<{ clients: (Client & { totalOrders: number; totalSpent: number })[]; total: number }> {
  let whereClause = "WHERE 1=1"
  const params: (string | number)[] = []

  if (options?.status && options.status !== "all") {
    whereClause += " AND c.status = ?"
    params.push(options.status)
  }

  if (options?.search) {
    whereClause += " AND (c.business_name LIKE ? OR c.email LIKE ? OR c.contact_person LIKE ?)"
    const searchTerm = `%${options.search}%`
    params.push(searchTerm, searchTerm, searchTerm)
  }

  const countRows = await query<RowDataPacket[]>(
    `SELECT COUNT(*) as total FROM clients c ${whereClause}`,
    params
  )
  const total = countRows[0].total

  let sql = `
    SELECT 
      c.id, c.email, c.business_name as businessName, c.contact_person as contactPerson, 
      c.phone, c.gst_number as gstNumber, c.address_line1 as addressLine1, 
      c.address_line2 as addressLine2, c.city, c.state, c.postal_code as postalCode, 
      c.country, c.status, c.email_verified as emailVerified,
      c.created_at as createdAt, c.updated_at as updatedAt,
      COUNT(DISTINCT o.id) as totalOrders,
      COALESCE(SUM(CASE WHEN o.payment_status = 'paid' THEN o.total_amount ELSE 0 END), 0) as totalSpent
    FROM clients c
    LEFT JOIN orders o ON c.id = o.client_id
    ${whereClause}
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `

  if (options?.limit) {
    sql += ` LIMIT ${options.limit}`
    if (options?.offset) {
      sql += ` OFFSET ${options.offset}`
    }
  }

  const rows = await query<RowDataPacket[]>(sql, params)
  
  const clients = rows.map(row => ({
    id: row.id,
    email: row.email,
    businessName: row.businessName,
    contactPerson: row.contactPerson,
    phone: row.phone,
    gstNumber: row.gstNumber,
    addressLine1: row.addressLine1,
    addressLine2: row.addressLine2,
    city: row.city,
    state: row.state,
    postalCode: row.postalCode,
    country: row.country,
    status: row.status as Client["status"],
    emailVerified: Boolean(row.emailVerified),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    totalOrders: row.totalOrders,
    totalSpent: parseFloat(row.totalSpent),
  }))

  return { clients, total }
}

export async function createClient(data: {
  email: string
  passwordHash: string
  businessName: string
  contactPerson: string
  phone: string
  gstNumber?: string
}): Promise<string> {
  const id = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  await execute(
    `INSERT INTO clients (id, email, password_hash, business_name, contact_person, phone, gst_number, status, email_verified) 
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', FALSE)`,
    [id, data.email, data.passwordHash, data.businessName, data.contactPerson, data.phone, data.gstNumber || null]
  )
  return id
}

export async function updateClientStatus(clientId: string, status: Client["status"]): Promise<boolean> {
  const result = await execute(
    "UPDATE clients SET status = ? WHERE id = ?",
    [status, clientId]
  )
  return result.affectedRows > 0
}

export async function updateClientProfile(clientId: string, data: {
  email?: string
  contactPerson?: string
  phone?: string
  businessName?: string
  gstNumber?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
}): Promise<boolean> {
  const fields: string[] = []
  const values: any[] = []

  if (data.email !== undefined) {
    fields.push("email = ?")
    values.push(data.email)
  }
  if (data.contactPerson !== undefined) {
    fields.push("contact_person = ?")
    values.push(data.contactPerson)
  }
  if (data.phone !== undefined) {
    fields.push("phone = ?")
    values.push(data.phone)
  }
  if (data.businessName !== undefined) {
    fields.push("business_name = ?")
    values.push(data.businessName)
  }
  if (data.gstNumber !== undefined) {
    fields.push("gst_number = ?")
    values.push(data.gstNumber)
  }
  if (data.addressLine1 !== undefined) {
    fields.push("address_line1 = ?")
    values.push(data.addressLine1)
  }
  if (data.addressLine2 !== undefined) {
    fields.push("address_line2 = ?")
    values.push(data.addressLine2)
  }
  if (data.city !== undefined) {
    fields.push("city = ?")
    values.push(data.city)
  }
  if (data.state !== undefined) {
    fields.push("state = ?")
    values.push(data.state)
  }
  if (data.postalCode !== undefined) {
    fields.push("postal_code = ?")
    values.push(data.postalCode)
  }
  if (data.country !== undefined) {
    fields.push("country = ?")
    values.push(data.country)
  }

  if (fields.length === 0) return false

  values.push(clientId)
  const result = await execute(
    `UPDATE clients SET ${fields.join(", ")} WHERE id = ?`,
    values
  )
  return result.affectedRows > 0
}

// =====================================================
// ADMIN FUNCTIONS
// =====================================================

export async function getAdminByEmail(email: string): Promise<(Admin & { passwordHash: string }) | null> {
  const rows = await query<RowDataPacket[]>(
    `SELECT 
      id, email, password_hash as passwordHash, name, phone, role, avatar_url as avatarUrl,
      is_active as isActive, last_login as lastLogin,
      created_at as createdAt, updated_at as updatedAt
    FROM admins 
    WHERE email = ?`,
    [email]
  )
  if (rows.length === 0) return null
  const row = rows[0]
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.passwordHash,
    name: row.name,
    phone: row.phone,
    role: row.role,
    avatarUrl: row.avatarUrl,
    isActive: Boolean(row.isActive),
    lastLogin: row.lastLogin,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export async function getAdminById(id: string): Promise<Admin | null> {
  const rows = await query<RowDataPacket[]>(
    `SELECT 
      id, email, name, phone, role, avatar_url as avatarUrl,
      is_active as isActive, last_login as lastLogin,
      created_at as createdAt, updated_at as updatedAt
    FROM admins 
    WHERE id = ?`,
    [id]
  )
  if (rows.length === 0) return null
  const row = rows[0]
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    phone: row.phone,
    role: row.role,
    avatarUrl: row.avatarUrl,
    isActive: Boolean(row.isActive),
    lastLogin: row.lastLogin,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export async function updateAdminLastLogin(adminId: string): Promise<void> {
  await execute(
    "UPDATE admins SET last_login = NOW() WHERE id = ?",
    [adminId]
  )
}

export async function updateAdminProfile(adminId: string, data: {
  email?: string
  name?: string
  phone?: string
  avatarUrl?: string
}): Promise<boolean> {
  const fields: string[] = []
  const values: any[] = []

  if (data.email !== undefined) {
    fields.push("email = ?")
    values.push(data.email)
  }
  if (data.name !== undefined) {
    fields.push("name = ?")
    values.push(data.name)
  }
  if (data.phone !== undefined) {
    fields.push("phone = ?")
    values.push(data.phone)
  }
  if (data.avatarUrl !== undefined) {
    fields.push("avatar_url = ?")
    values.push(data.avatarUrl)
  }

  if (fields.length === 0) return false

  values.push(adminId)
  const result = await execute(
    `UPDATE admins SET ${fields.join(", ")} WHERE id = ?`,
    values
  )
  return result.affectedRows > 0
}

// =====================================================
// SESSION FUNCTIONS
// =====================================================

export async function createSession(data: {
  userId: string
  userType: "client" | "admin"
  token: string
  expiresAt: Date
  ipAddress?: string
  userAgent?: string
}): Promise<string> {
  const id = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  await execute(
    `INSERT INTO sessions (id, user_id, user_type, token, expires_at, ip_address, user_agent) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, data.userId, data.userType, data.token, data.expiresAt, data.ipAddress || null, data.userAgent || null]
  )
  return id
}

export async function getSessionByToken(token: string): Promise<Session | null> {
  const rows = await query<RowDataPacket[]>(
    `SELECT 
      id, user_id as userId, user_type as userType, token, expires_at as expiresAt,
      ip_address as ipAddress, user_agent as userAgent, created_at as createdAt
    FROM sessions 
    WHERE token = ? AND expires_at > NOW()`,
    [token]
  )
  if (rows.length === 0) return null
  const row = rows[0]
  return {
    id: row.id,
    userId: row.userId,
    userType: row.userType,
    token: row.token,
    expiresAt: row.expiresAt,
    ipAddress: row.ipAddress,
    userAgent: row.userAgent,
    createdAt: row.createdAt,
  }
}

export async function deleteSession(token: string): Promise<boolean> {
  const result = await execute(
    "DELETE FROM sessions WHERE token = ?",
    [token]
  )
  return result.affectedRows > 0
}

export async function deleteExpiredSessions(): Promise<number> {
  const result = await execute(
    "DELETE FROM sessions WHERE expires_at < NOW()"
  )
  return result.affectedRows
}

// =====================================================
// CART FUNCTIONS
// =====================================================

export async function getOrCreateCart(clientId: string): Promise<Cart> {
  // Try to find existing cart
  const rows = await query<RowDataPacket[]>(
    "SELECT id, client_id as clientId, created_at as createdAt, updated_at as updatedAt FROM carts WHERE client_id = ?",
    [clientId]
  )
  
  let cartId: string
  if (rows.length === 0) {
    // Create new cart
    cartId = `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    await execute(
      "INSERT INTO carts (id, client_id) VALUES (?, ?)",
      [cartId, clientId]
    )
  } else {
    cartId = rows[0].id
  }

  // Get cart items
  const items = await getCartItems(cartId)
  
  return {
    id: cartId,
    clientId,
    items,
    createdAt: rows.length > 0 ? rows[0].createdAt : new Date(),
    updatedAt: rows.length > 0 ? rows[0].updatedAt : new Date(),
  }
}

export async function getCartItems(cartId: string): Promise<CartItem[]> {
  const rows = await query<RowDataPacket[]>(
    `SELECT 
      ci.id, ci.cart_id as cartId, ci.product_id as productId, ci.variant_id as variantId,
      ci.quantity, ci.customization, ci.created_at as createdAt, ci.updated_at as updatedAt,
      p.id as p_id, p.category_id as p_categoryId, p.name as p_name, p.slug as p_slug,
      p.description as p_description, p.short_description as p_shortDescription,
      p.base_price as p_basePrice, p.min_order_quantity as p_minOrderQuantity,
      p.image_url as p_imageUrl, p.features as p_features, p.is_customizable as p_isCustomizable,
      p.customization_options as p_customizationOptions, p.is_active as p_isActive, p.is_featured as p_isFeatured,
      pv.id as v_id, pv.product_id as v_productId, pv.sku as v_sku, pv.name as v_name,
      pv.size as v_size, pv.color as v_color, pv.ply as v_ply, pv.price as v_price,
      pv.stock_quantity as v_stockQuantity, pv.is_active as v_isActive
    FROM cart_items ci
    LEFT JOIN products p ON ci.product_id = p.id
    LEFT JOIN product_variants pv ON ci.variant_id = pv.id
    WHERE ci.cart_id = ?
    ORDER BY ci.created_at DESC`,
    [cartId]
  )

  // Helper function to safely parse JSON fields
  const safeJsonParse = (value: any, fieldName: string) => {
    if (!value) return undefined
    try {
      // If it's already an object, return it as-is
      if (typeof value === 'object') return value
      return JSON.parse(value)
    } catch (e) {
      console.error(`Failed to parse ${fieldName}:`, value)
      console.error('Parse error:', e)
      return undefined
    }
  }

  return rows.map(row => ({
    id: row.id,
    cartId: row.cartId,
    productId: row.productId,
    variantId: row.variantId,
    quantity: row.quantity,
    customization: safeJsonParse(row.customization, 'customization'),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    product: row.p_id ? {
      id: row.p_id,
      categoryId: row.p_categoryId,
      name: row.p_name,
      slug: row.p_slug,
      description: row.p_description,
      shortDescription: row.p_shortDescription,
      basePrice: parseFloat(row.p_basePrice),
      minOrderQuantity: row.p_minOrderQuantity,
      imageUrl: row.p_imageUrl,
      features: safeJsonParse(row.p_features, 'features'),
      isCustomizable: Boolean(row.p_isCustomizable),
      customizationOptions: safeJsonParse(row.p_customizationOptions, 'customizationOptions'),
      isActive: Boolean(row.p_isActive),
      isFeatured: Boolean(row.p_isFeatured),
    } : undefined,
    variant: row.v_id ? {
      id: row.v_id,
      productId: row.v_productId,
      sku: row.v_sku,
      name: row.v_name,
      size: row.v_size,
      color: row.v_color,
      ply: row.v_ply,
      price: parseFloat(row.v_price),
      stockQuantity: row.v_stockQuantity,
      isActive: Boolean(row.v_isActive),
    } : undefined,
  }))
}

export async function addToCart(
  cartId: string,
  productId: string,
  variantId: string | null,
  quantity: number,
  customization?: object
): Promise<CartItem> {
  // Handle customization - check if it's already a string
  let customizationValue = null
  if (customization) {
    customizationValue = typeof customization === 'string' 
      ? customization 
      : JSON.stringify(customization)
  }

  // Check if item already exists in cart
  const existing = await query<RowDataPacket[]>(
    `SELECT id, quantity FROM cart_items 
     WHERE cart_id = ? AND product_id = ? AND (variant_id = ? OR (variant_id IS NULL AND ? IS NULL))
     AND (customization = ? OR (customization IS NULL AND ? IS NULL))`,
    [cartId, productId, variantId, variantId, customizationValue, customizationValue]
  )

  let itemId: string
  if (existing.length > 0) {
    // Update existing item
    itemId = existing[0].id
    await execute(
      "UPDATE cart_items SET quantity = quantity + ?, updated_at = NOW() WHERE id = ?",
      [quantity, itemId]
    )
  } else {
    // Add new item
    itemId = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    await execute(
      `INSERT INTO cart_items (id, cart_id, product_id, variant_id, quantity, customization) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [itemId, cartId, productId, variantId, quantity, customizationValue]
    )
  }

  // Update cart timestamp
  await execute("UPDATE carts SET updated_at = NOW() WHERE id = ?", [cartId])

  // Return the updated item
  const items = await getCartItems(cartId)
  return items.find(item => item.id === itemId) || items[0]
}

export async function updateCartItemQuantity(itemId: string, quantity: number): Promise<boolean> {
  if (quantity <= 0) {
    return await removeCartItem(itemId)
  }
  const result = await execute(
    "UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE id = ?",
    [quantity, itemId]
  )
  return result.affectedRows > 0
}

export async function removeCartItem(itemId: string): Promise<boolean> {
  const result = await execute(
    "DELETE FROM cart_items WHERE id = ?",
    [itemId]
  )
  return result.affectedRows > 0
}

export async function clearCart(cartId: string): Promise<boolean> {
  const result = await execute(
    "DELETE FROM cart_items WHERE cart_id = ?",
    [cartId]
  )
  return result.affectedRows >= 0
}

let deliverySchemaReadyPromise: Promise<void> | null = null
let contactSchemaReadyPromise: Promise<void> | null = null

async function ensureDeliverySchema(): Promise<void> {
  if (!deliverySchemaReadyPromise) {
    deliverySchemaReadyPromise = (async () => {
      await execute(
        `CREATE TABLE IF NOT EXISTS delivery_settings (
          id VARCHAR(36) PRIMARY KEY,
          production_latitude DECIMAL(10, 7) NOT NULL,
          production_longitude DECIMAL(10, 7) NOT NULL,
          delivery_cost_per_km DECIMAL(10, 2) NOT NULL DEFAULT 12.00,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`
      )

      await execute(
        `INSERT INTO delivery_settings (
          id,
          production_latitude,
          production_longitude,
          delivery_cost_per_km
        )
        SELECT 'default', 21.6338638, 73.0193249, 12.00
        WHERE NOT EXISTS (
          SELECT 1 FROM delivery_settings WHERE id = 'default'
        )`
      )

      const alterStatements = [
        "ALTER TABLE orders ADD COLUMN requires_shipping BOOLEAN NOT NULL DEFAULT TRUE",
        "ALTER TABLE orders ADD COLUMN delivery_latitude DECIMAL(10, 7) NULL",
        "ALTER TABLE orders ADD COLUMN delivery_longitude DECIMAL(10, 7) NULL",
        "ALTER TABLE orders ADD COLUMN production_latitude DECIMAL(10, 7) NULL",
        "ALTER TABLE orders ADD COLUMN production_longitude DECIMAL(10, 7) NULL",
        "ALTER TABLE orders ADD COLUMN distance_km DECIMAL(10, 2) NULL",
        "ALTER TABLE orders ADD COLUMN delivery_cost_per_km DECIMAL(10, 2) NULL",
        "ALTER TABLE orders ADD COLUMN admin_hidden_at TIMESTAMP NULL",
        "ALTER TABLE orders ADD COLUMN client_hidden_at TIMESTAMP NULL",
      ]

      for (const statement of alterStatements) {
        try {
          await execute(statement)
        } catch (error: any) {
          if (error?.code !== "ER_DUP_FIELDNAME") {
            throw error
          }
        }
      }

      await execute(
        `UPDATE contact_messages
         SET status = 'new'
         WHERE status IS NULL OR status = ''`
      )
    })()
  }

  await deliverySchemaReadyPromise
}

export function calculateDistanceKm(
  originLatitude: number,
  originLongitude: number,
  destinationLatitude: number,
  destinationLongitude: number
): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180
  const earthRadiusKm = 6371

  const latitudeDifference = toRadians(destinationLatitude - originLatitude)
  const longitudeDifference = toRadians(destinationLongitude - originLongitude)
  const latitude1 = toRadians(originLatitude)
  const latitude2 = toRadians(destinationLatitude)

  const haversineA =
    Math.sin(latitudeDifference / 2) * Math.sin(latitudeDifference / 2) +
    Math.cos(latitude1) * Math.cos(latitude2) *
    Math.sin(longitudeDifference / 2) * Math.sin(longitudeDifference / 2)

  const haversineC = 2 * Math.atan2(Math.sqrt(haversineA), Math.sqrt(1 - haversineA))
  return earthRadiusKm * haversineC
}

export async function getDeliverySettings(): Promise<DeliverySettings> {
  await ensureDeliverySchema()

  const rows = await query<RowDataPacket[]>(
    `SELECT
      id,
      production_latitude as productionLatitude,
      production_longitude as productionLongitude,
      delivery_cost_per_km as deliveryCostPerKm,
      created_at as createdAt,
      updated_at as updatedAt
    FROM delivery_settings
    WHERE id = 'default'
    LIMIT 1`
  )

  const row = rows[0]
  return {
    id: row.id,
    productionLatitude: parseFloat(row.productionLatitude),
    productionLongitude: parseFloat(row.productionLongitude),
    deliveryCostPerKm: parseFloat(row.deliveryCostPerKm),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export async function updateDeliverySettings(updates: {
  productionLatitude?: number
  productionLongitude?: number
  deliveryCostPerKm?: number
}): Promise<DeliverySettings> {
  await ensureDeliverySchema()

  const setClauses: string[] = []
  const params: (number | string)[] = []

  if (updates.productionLatitude !== undefined) {
    setClauses.push("production_latitude = ?")
    params.push(updates.productionLatitude)
  }

  if (updates.productionLongitude !== undefined) {
    setClauses.push("production_longitude = ?")
    params.push(updates.productionLongitude)
  }

  if (updates.deliveryCostPerKm !== undefined) {
    setClauses.push("delivery_cost_per_km = ?")
    params.push(updates.deliveryCostPerKm)
  }

  if (setClauses.length > 0) {
    params.push("default")
    await execute(
      `UPDATE delivery_settings
       SET ${setClauses.join(", ")}, updated_at = NOW()
       WHERE id = ?`,
      params
    )
  }

  return await getDeliverySettings()
}

async function ensureContactSchema(): Promise<void> {
  if (!contactSchemaReadyPromise) {
    contactSchemaReadyPromise = (async () => {
      await execute(
        `CREATE TABLE IF NOT EXISTS contact_messages (
          id VARCHAR(36) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          company VARCHAR(255),
          phone VARCHAR(20),
          subject VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          status ENUM('new', 'replied') DEFAULT 'new',
          admin_reply TEXT,
          replied_by_admin_id VARCHAR(36),
          replied_at TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_status (status),
          INDEX idx_created (created_at),
          INDEX idx_email (email)
        )`
      )

      const alterStatements = [
        "ALTER TABLE contact_messages ADD COLUMN company VARCHAR(255)",
        "ALTER TABLE contact_messages ADD COLUMN phone VARCHAR(20)",
        "ALTER TABLE contact_messages ADD COLUMN subject VARCHAR(255) NOT NULL DEFAULT 'Website Inquiry'",
        "ALTER TABLE contact_messages ADD COLUMN status ENUM('new', 'replied') DEFAULT 'new'",
        "ALTER TABLE contact_messages ADD COLUMN admin_reply TEXT",
        "ALTER TABLE contact_messages ADD COLUMN replied_by_admin_id VARCHAR(36)",
        "ALTER TABLE contact_messages ADD COLUMN replied_at TIMESTAMP NULL",
      ]

      for (const statement of alterStatements) {
        try {
          await execute(statement)
        } catch (error: any) {
          if (error?.code !== "ER_DUP_FIELDNAME") {
            throw error
          }
        }
      }
    })()
  }

  await contactSchemaReadyPromise
}

export async function createContactMessage(data: {
  name: string
  email: string
  company?: string
  phone?: string
  subject: string
  message: string
}): Promise<string> {
  await ensureContactSchema()
  const id = `cm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  await execute(
    `INSERT INTO contact_messages (
      id, name, email, company, phone, subject, message, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'new')`,
    [
      id,
      data.name,
      data.email,
      data.company || null,
      data.phone || null,
      data.subject,
      data.message,
    ]
  )

  return id
}

export async function getContactMessageById(id: string): Promise<ContactMessage | null> {
  await ensureContactSchema()

  const rows = await query<RowDataPacket[]>(
    `SELECT
      id,
      name,
      email,
      company,
      phone,
      subject,
      message,
      status,
      admin_reply as adminReply,
      replied_by_admin_id as repliedByAdminId,
      replied_at as repliedAt,
      created_at as createdAt,
      updated_at as updatedAt
    FROM contact_messages
    WHERE id = ?
    LIMIT 1`,
    [id]
  )

  if (rows.length === 0) return null
  const row = rows[0]

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    company: row.company,
    phone: row.phone,
    subject: row.subject,
    message: row.message,
    status: row.status || "new",
    adminReply: row.adminReply,
    repliedByAdminId: row.repliedByAdminId,
    repliedAt: row.repliedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export async function getContactMessages(options?: {
  status?: "new" | "replied"
  limit?: number
  offset?: number
}): Promise<{ messages: ContactMessage[]; total: number }> {
  await ensureContactSchema()

  let whereClause = "WHERE 1=1"
  const params: (string | number)[] = []

  if (options?.status) {
    whereClause += " AND status = ?"
    params.push(options.status)
  }

  const countRows = await query<RowDataPacket[]>(
    `SELECT COUNT(*) as total FROM contact_messages ${whereClause}`,
    params
  )
  const total = countRows[0].total

  let sql = `
    SELECT
      id,
      name,
      email,
      company,
      phone,
      subject,
      message,
      status,
      admin_reply as adminReply,
      replied_by_admin_id as repliedByAdminId,
      replied_at as repliedAt,
      created_at as createdAt,
      updated_at as updatedAt
    FROM contact_messages
    ${whereClause}
    ORDER BY created_at DESC
  `

  if (options?.limit) {
    sql += ` LIMIT ${options.limit}`
    if (options?.offset) {
      sql += ` OFFSET ${options.offset}`
    }
  }

  const rows = await query<RowDataPacket[]>(sql, params)
  const messages: ContactMessage[] = rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    company: row.company,
    phone: row.phone,
    subject: row.subject,
    message: row.message,
    status: row.status || "new",
    adminReply: row.adminReply,
    repliedByAdminId: row.repliedByAdminId,
    repliedAt: row.repliedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }))

  return { messages, total }
}

export async function replyToContactMessage(
  messageId: string,
  adminReply: string,
  adminId: string
): Promise<ContactMessage | null> {
  await ensureContactSchema()

  const result = await execute(
    `UPDATE contact_messages
     SET status = 'replied', admin_reply = ?, replied_by_admin_id = ?, replied_at = NOW(), updated_at = NOW()
     WHERE id = ?`,
    [adminReply, adminId, messageId]
  )

  if (result.affectedRows === 0) return null
  return await getContactMessageById(messageId)
}

export async function deleteContactMessageById(id: string): Promise<boolean> {
  await ensureContactSchema()
  const result = await execute(
    `DELETE FROM contact_messages WHERE id = ?`,
    [id]
  )
  return result.affectedRows > 0
}

export async function deleteContactMessages(options?: {
  status?: "new" | "replied"
}): Promise<number> {
  await ensureContactSchema()

  if (options?.status) {
    const result = await execute(
      `DELETE FROM contact_messages WHERE status = ?`,
      [options.status]
    )
    return result.affectedRows
  }

  const result = await execute(`DELETE FROM contact_messages`)
  return result.affectedRows
}

// =====================================================
// ORDER FUNCTIONS
// =====================================================

export function generateOrderNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `PE-${year}-${random}`
}

export async function createOrder(data: {
  clientId: string
  orderNumber: string
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
  requiresShipping: boolean
  deliveryLatitude?: number
  deliveryLongitude?: number
  productionLatitude?: number
  productionLongitude?: number
  distanceKm?: number
  deliveryCostPerKm?: number
  paymentMethod: "bank_transfer" | "upi" | "credit_terms"
  customerNotes?: string
  items: {
    productId: string
    variantId?: string
    productName: string
    variantName?: string
    sku?: string
    quantity: number
    unitPrice: number
    totalPrice: number
    customization?: object
  }[]
}): Promise<Order> {
  await ensureDeliverySchema()
  const connection = await getConnection()
  
  try {
    await connection.beginTransaction()

    const orderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    console.log('Creating order with data:', {
      clientId: data.clientId,
      itemCount: data.items.length,
      total: data.totalAmount
    })
    
    // Create order
    await connection.execute(
      `INSERT INTO orders (
        id, client_id, order_number, status, payment_status, payment_method,
        subtotal, tax_amount, shipping_amount, discount_amount, total_amount,
        shipping_name, shipping_phone, shipping_address_line1, shipping_address_line2,
        shipping_city, shipping_state, shipping_postal_code, shipping_country,
        requires_shipping, delivery_latitude, delivery_longitude,
        production_latitude, production_longitude, distance_km, delivery_cost_per_km,
        customer_notes
      ) VALUES (?, ?, ?, 'pending', 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'India', ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId, data.clientId, data.orderNumber, data.paymentMethod,
        data.subtotal, data.taxAmount, data.shippingAmount, data.discountAmount, data.totalAmount,
        data.shippingName, data.shippingPhone, data.shippingAddressLine1, data.shippingAddressLine2 || null,
        data.shippingCity, data.shippingState, data.shippingPostalCode,
        data.requiresShipping,
        data.deliveryLatitude ?? null,
        data.deliveryLongitude ?? null,
        data.productionLatitude ?? null,
        data.productionLongitude ?? null,
        data.distanceKm ?? null,
        data.deliveryCostPerKm ?? null,
        data.customerNotes || null
      ]
    )

    // Create order items and update stock
    for (const item of data.items) {
      const itemId = `oi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      console.log('Creating order item:', {
        productId: item.productId,
        productName: item.productName,
        hasCustomization: !!item.customization,
        customizationType: typeof item.customization
      })
      
      // Handle customization - only stringify if it exists and is an object
      let customizationValue = null
      if (item.customization !== null && item.customization !== undefined) {
        console.log('Raw customization:', item.customization)
        // If it's already a string, don't stringify again
        if (typeof item.customization === 'string') {
          try {
            // Verify it's valid JSON
            JSON.parse(item.customization)
            customizationValue = item.customization
            console.log('Using string customization as-is')
          } catch (e) {
            console.log('String is not valid JSON, wrapping it')
            // If not valid JSON, wrap it
            customizationValue = JSON.stringify({ value: item.customization })
          }
        } else {
          // It's an object, stringify it
          customizationValue = JSON.stringify(item.customization)
          console.log('Stringified object customization:', customizationValue)
        }
      }
      
      console.log('Final customization for DB:', customizationValue)
      
      await connection.execute(
        `INSERT INTO order_items (
          id, order_id, product_id, variant_id, product_name, variant_name, sku,
          quantity, unit_price, total_price, customization
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          itemId, orderId, item.productId, item.variantId || null,
          item.productName, item.variantName || null, item.sku || null,
          item.quantity, item.unitPrice, item.totalPrice,
          customizationValue
        ]
      )
      
      console.log('Order item created successfully:', itemId)

      // Update stock if variant
      if (item.variantId) {
        await connection.execute(
          "UPDATE product_variants SET stock_quantity = GREATEST(0, stock_quantity - ?) WHERE id = ?",
          [item.quantity, item.variantId]
        )
      }
    }

    await connection.commit()
    console.log('Order committed successfully:', orderId)

    // Fetch and return the created order
    const order = await getOrderById(orderId)
    return order!
  } catch (error) {
    console.error('Error creating order:', error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  await ensureDeliverySchema()
  const rows = await query<RowDataPacket[]>(
    `SELECT 
      o.id, o.client_id as clientId, o.order_number as orderNumber, o.status, 
      o.payment_status as paymentStatus, o.payment_method as paymentMethod,
      o.subtotal, o.tax_amount as taxAmount, o.shipping_amount as shippingAmount,
      o.discount_amount as discountAmount, o.total_amount as totalAmount,
      o.shipping_name as shippingName, o.shipping_phone as shippingPhone,
      o.shipping_address_line1 as shippingAddressLine1, o.shipping_address_line2 as shippingAddressLine2,
      o.shipping_city as shippingCity, o.shipping_state as shippingState,
      o.shipping_postal_code as shippingPostalCode, o.shipping_country as shippingCountry,
      o.requires_shipping as requiresShipping,
      o.delivery_latitude as deliveryLatitude, o.delivery_longitude as deliveryLongitude,
      o.production_latitude as productionLatitude, o.production_longitude as productionLongitude,
      o.distance_km as distanceKm, o.delivery_cost_per_km as deliveryCostPerKm,
      o.customer_notes as customerNotes, o.admin_notes as adminNotes,
      o.admin_hidden_at as adminHiddenAt, o.client_hidden_at as clientHiddenAt,
      o.tracking_number as trackingNumber, o.shipped_at as shippedAt, o.delivered_at as deliveredAt,
      o.created_at as createdAt, o.updated_at as updatedAt
    FROM orders o
    WHERE o.id = ?`,
    [id]
  )
  
  if (rows.length === 0) return null
  const row = rows[0]

  // Get order items
  const itemRows = await query<RowDataPacket[]>(
    `SELECT 
      oi.id, oi.order_id as orderId, oi.product_id as productId, oi.variant_id as variantId,
      p.image_url as productImageUrl,
      product_name as productName, variant_name as variantName, sku,
      quantity, unit_price as unitPrice, total_price as totalPrice, customization,
      oi.created_at as createdAt
    FROM order_items oi
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ?`,
    [id]
  )

  // Helper function to safely parse JSON fields
  const safeJsonParse = (value: any, fieldName: string) => {
    if (!value) return undefined
    try {
      // If it's already an object, return it as-is
      if (typeof value === 'object') return value
      return JSON.parse(value)
    } catch (e) {
      console.error(`Failed to parse ${fieldName}:`, value)
      console.error('Parse error:', e)
      return undefined
    }
  }

  const items: OrderItem[] = itemRows.map(item => ({
    id: item.id,
    orderId: item.orderId,
    productId: item.productId,
    productImageUrl: item.productImageUrl,
    variantId: item.variantId,
    productName: item.productName,
    variantName: item.variantName,
    sku: item.sku,
    quantity: item.quantity,
    unitPrice: parseFloat(item.unitPrice),
    totalPrice: parseFloat(item.totalPrice),
    customization: safeJsonParse(item.customization, 'customization'),
    createdAt: item.createdAt,
  }))

  // Get client info
  const client = await getClientById(row.clientId)

  return {
    id: row.id,
    clientId: row.clientId,
    orderNumber: row.orderNumber,
    status: row.status,
    paymentStatus: row.paymentStatus,
    paymentMethod: row.paymentMethod,
    subtotal: parseFloat(row.subtotal),
    taxAmount: parseFloat(row.taxAmount),
    shippingAmount: parseFloat(row.shippingAmount),
    discountAmount: parseFloat(row.discountAmount),
    totalAmount: parseFloat(row.totalAmount),
    shippingName: row.shippingName,
    shippingPhone: row.shippingPhone,
    shippingAddressLine1: row.shippingAddressLine1,
    shippingAddressLine2: row.shippingAddressLine2,
    shippingCity: row.shippingCity,
    shippingState: row.shippingState,
    shippingPostalCode: row.shippingPostalCode,
    shippingCountry: row.shippingCountry,
    requiresShipping: Boolean(row.requiresShipping),
    deliveryLatitude: row.deliveryLatitude !== null ? parseFloat(row.deliveryLatitude) : undefined,
    deliveryLongitude: row.deliveryLongitude !== null ? parseFloat(row.deliveryLongitude) : undefined,
    productionLatitude: row.productionLatitude !== null ? parseFloat(row.productionLatitude) : undefined,
    productionLongitude: row.productionLongitude !== null ? parseFloat(row.productionLongitude) : undefined,
    distanceKm: row.distanceKm !== null ? parseFloat(row.distanceKm) : undefined,
    deliveryCostPerKm: row.deliveryCostPerKm !== null ? parseFloat(row.deliveryCostPerKm) : undefined,
    customerNotes: row.customerNotes,
    adminNotes: row.adminNotes,
    adminHiddenAt: row.adminHiddenAt,
    clientHiddenAt: row.clientHiddenAt,
    trackingNumber: row.trackingNumber,
    shippedAt: row.shippedAt,
    deliveredAt: row.deliveredAt,
    items,
    client: client || undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export async function getOrders(options?: {
  clientId?: string
  status?: string
  search?: string
  excludeAdminHidden?: boolean
  onlyAdminHidden?: boolean
  excludeClientHidden?: boolean
  onlyClientHidden?: boolean
  limit?: number
  offset?: number
}): Promise<{ orders: Order[]; total: number }> {
  await ensureDeliverySchema()
  let whereClause = "WHERE 1=1"
  const params: (string | number)[] = []

  if (options?.clientId) {
    whereClause += " AND o.client_id = ?"
    params.push(options.clientId)
  }

  if (options?.status && options.status !== "all") {
    whereClause += " AND o.status = ?"
    params.push(options.status)
  }

  if (options?.search) {
    whereClause += " AND o.order_number LIKE ?"
    params.push(`%${options.search}%`)
  }

  if (options?.onlyAdminHidden) {
    whereClause += " AND o.admin_hidden_at IS NOT NULL"
  } else if (options?.excludeAdminHidden) {
    whereClause += " AND o.admin_hidden_at IS NULL"
  }

  if (options?.onlyClientHidden) {
    whereClause += " AND o.client_hidden_at IS NOT NULL"
  } else if (options?.excludeClientHidden) {
    whereClause += " AND o.client_hidden_at IS NULL"
  }

  const countRows = await query<RowDataPacket[]>(
    `SELECT COUNT(*) as total FROM orders o ${whereClause}`,
    params
  )
  const total = countRows[0].total

  let sql = `
    SELECT 
      o.id, o.client_id as clientId, o.order_number as orderNumber, o.status, 
      o.payment_status as paymentStatus, o.payment_method as paymentMethod,
      o.subtotal, o.tax_amount as taxAmount, o.shipping_amount as shippingAmount,
      o.discount_amount as discountAmount, o.total_amount as totalAmount,
      o.shipping_name as shippingName, o.shipping_phone as shippingPhone,
      o.shipping_address_line1 as shippingAddressLine1, o.shipping_address_line2 as shippingAddressLine2,
      o.shipping_city as shippingCity, o.shipping_state as shippingState,
      o.shipping_postal_code as shippingPostalCode, o.shipping_country as shippingCountry,
      o.requires_shipping as requiresShipping,
      o.delivery_latitude as deliveryLatitude, o.delivery_longitude as deliveryLongitude,
      o.production_latitude as productionLatitude, o.production_longitude as productionLongitude,
      o.distance_km as distanceKm, o.delivery_cost_per_km as deliveryCostPerKm,
      o.customer_notes as customerNotes, o.admin_notes as adminNotes,
      o.admin_hidden_at as adminHiddenAt, o.client_hidden_at as clientHiddenAt,
      o.tracking_number as trackingNumber, o.shipped_at as shippedAt, o.delivered_at as deliveredAt,
      o.created_at as createdAt, o.updated_at as updatedAt,
      c.business_name as clientBusinessName, c.contact_person as clientContactPerson, c.email as clientEmail
    FROM orders o
    LEFT JOIN clients c ON o.client_id = c.id
    ${whereClause}
    ORDER BY o.created_at DESC
  `

  if (options?.limit) {
    sql += ` LIMIT ${options.limit}`
    if (options?.offset) {
      sql += ` OFFSET ${options.offset}`
    }
  }

  const rows = await query<RowDataPacket[]>(sql, params)
  
  // Helper function to safely parse JSON fields
  const safeJsonParse = (value: any, fieldName: string) => {
    if (!value) return undefined
    try {
      // If it's already an object, return it as-is
      if (typeof value === 'object') return value
      return JSON.parse(value)
    } catch (e) {
      console.error(`Failed to parse ${fieldName}:`, value)
      console.error('Parse error:', e)
      return undefined
    }
  }
  
  // Fetch items for all orders
  const orderIds = rows.map(row => row.id)
  let itemsMap: Record<string, OrderItem[]> = {}
  
  if (orderIds.length > 0) {
    const itemRows = await query<RowDataPacket[]>(
      `SELECT 
        oi.id, oi.order_id as orderId, oi.product_id as productId, oi.variant_id as variantId,
        p.image_url as productImageUrl,
        product_name as productName, variant_name as variantName, sku,
        quantity, unit_price as unitPrice, total_price as totalPrice, customization,
        oi.created_at as createdAt
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id IN (${orderIds.map(() => '?').join(',')})`,
      orderIds
    )
    
    // Group items by order ID
    itemRows.forEach(item => {
      if (!itemsMap[item.orderId]) {
        itemsMap[item.orderId] = []
      }
      itemsMap[item.orderId].push({
        id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        productImageUrl: item.productImageUrl,
        variantId: item.variantId,
        productName: item.productName,
        variantName: item.variantName,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice),
        totalPrice: parseFloat(item.totalPrice),
        customization: safeJsonParse(item.customization, 'customization'),
        createdAt: item.createdAt,
      })
    })
  }
  
  const orders: Order[] = rows.map(row => ({
    id: row.id,
    clientId: row.clientId,
    orderNumber: row.orderNumber,
    status: row.status,
    paymentStatus: row.paymentStatus,
    paymentMethod: row.paymentMethod,
    subtotal: parseFloat(row.subtotal),
    taxAmount: parseFloat(row.taxAmount),
    shippingAmount: parseFloat(row.shippingAmount),
    discountAmount: parseFloat(row.discountAmount),
    totalAmount: parseFloat(row.totalAmount),
    shippingName: row.shippingName,
    shippingPhone: row.shippingPhone,
    shippingAddressLine1: row.shippingAddressLine1,
    shippingAddressLine2: row.shippingAddressLine2,
    shippingCity: row.shippingCity,
    shippingState: row.shippingState,
    shippingPostalCode: row.shippingPostalCode,
    shippingCountry: row.shippingCountry,
    requiresShipping: Boolean(row.requiresShipping),
    deliveryLatitude: row.deliveryLatitude !== null ? parseFloat(row.deliveryLatitude) : undefined,
    deliveryLongitude: row.deliveryLongitude !== null ? parseFloat(row.deliveryLongitude) : undefined,
    productionLatitude: row.productionLatitude !== null ? parseFloat(row.productionLatitude) : undefined,
    productionLongitude: row.productionLongitude !== null ? parseFloat(row.productionLongitude) : undefined,
    distanceKm: row.distanceKm !== null ? parseFloat(row.distanceKm) : undefined,
    deliveryCostPerKm: row.deliveryCostPerKm !== null ? parseFloat(row.deliveryCostPerKm) : undefined,
    customerNotes: row.customerNotes,
    adminNotes: row.adminNotes,
    adminHiddenAt: row.adminHiddenAt,
    clientHiddenAt: row.clientHiddenAt,
    trackingNumber: row.trackingNumber,
    shippedAt: row.shippedAt,
    deliveredAt: row.deliveredAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    items: itemsMap[row.id] || [],
    client: row.clientBusinessName ? {
      id: row.clientId,
      email: row.clientEmail,
      businessName: row.clientBusinessName,
      contactPerson: row.clientContactPerson,
      phone: "",
      status: "approved" as const,
      emailVerified: true,
      createdAt: new Date(),
    } : undefined,
  }))

  return { orders, total }
}

export async function updateOrderStatus(
  orderId: string,
  updates: {
    status?: Order["status"]
    paymentStatus?: Order["paymentStatus"]
    trackingNumber?: string
    adminNotes?: string
  }
): Promise<boolean> {
  const setClauses: string[] = []
  const params: (string | null)[] = []

  if (updates.status) {
    setClauses.push("status = ?")
    params.push(updates.status)
    
    if (updates.status === "shipped") {
      setClauses.push("shipped_at = NOW()")
    } else if (updates.status === "delivered") {
      setClauses.push("delivered_at = NOW()")
    }
  }

  if (updates.paymentStatus) {
    setClauses.push("payment_status = ?")
    params.push(updates.paymentStatus)
  }

  if (updates.trackingNumber !== undefined) {
    setClauses.push("tracking_number = ?")
    params.push(updates.trackingNumber)
  }

  if (updates.adminNotes !== undefined) {
    setClauses.push("admin_notes = ?")
    params.push(updates.adminNotes)
  }

  if (setClauses.length === 0) return false

  params.push(orderId)
  const result = await execute(
    `UPDATE orders SET ${setClauses.join(", ")}, updated_at = NOW() WHERE id = ?`,
    params
  )
  return result.affectedRows > 0
}

export async function deleteOrderById(orderId: string): Promise<boolean> {
  await ensureDeliverySchema()
  const result = await execute(
    `UPDATE orders
     SET admin_hidden_at = NOW(), updated_at = NOW()
     WHERE id = ? AND admin_hidden_at IS NULL`,
    [orderId]
  )

  return result.affectedRows > 0
}

export async function deleteOrders(options?: {
  status?: Order["status"]
}): Promise<number> {
  await ensureDeliverySchema()

  if (options?.status) {
    const result = await execute(
      `UPDATE orders
       SET admin_hidden_at = NOW(), updated_at = NOW()
       WHERE status = ? AND admin_hidden_at IS NULL`,
      [options.status]
    )
    return result.affectedRows
  }

  const result = await execute(
    `UPDATE orders
     SET admin_hidden_at = NOW(), updated_at = NOW()
     WHERE admin_hidden_at IS NULL`
  )
  return result.affectedRows
}

export async function restoreOrderById(orderId: string): Promise<boolean> {
  await ensureDeliverySchema()
  const result = await execute(
    `UPDATE orders
     SET admin_hidden_at = NULL, updated_at = NOW()
     WHERE id = ? AND admin_hidden_at IS NOT NULL`,
    [orderId]
  )

  return result.affectedRows > 0
}

export async function hideOrderForClient(orderId: string, clientId: string): Promise<boolean> {
  await ensureDeliverySchema()
  const result = await execute(
    `UPDATE orders
     SET client_hidden_at = NOW(), updated_at = NOW()
     WHERE id = ? AND client_id = ? AND client_hidden_at IS NULL`,
    [orderId, clientId]
  )

  return result.affectedRows > 0
}

export async function restoreOrderForClient(orderId: string, clientId: string): Promise<boolean> {
  await ensureDeliverySchema()
  const result = await execute(
    `UPDATE orders
     SET client_hidden_at = NULL, updated_at = NOW()
     WHERE id = ? AND client_id = ? AND client_hidden_at IS NOT NULL`,
    [orderId, clientId]
  )

  return result.affectedRows > 0
}

// =====================================================
// DASHBOARD STATS FUNCTIONS
// =====================================================

export async function getDashboardStats(): Promise<{
  totalRevenue: number
  totalOrders: number
  totalClients: number
  pendingOrders: number
  lowStockItems: number
  revenueByMonth: { month: string; revenue: number }[]
  ordersByStatus: { status: string; count: number }[]
}> {
  // Total revenue
  const revenueRows = await query<RowDataPacket[]>(
    `SELECT COALESCE(SUM(total_amount), 0) as total 
     FROM orders 
     WHERE status IN ('confirmed', 'processing', 'shipped', 'delivered')`
  )
  const totalRevenue = parseFloat(revenueRows[0].total)

  // Total orders
  const orderRows = await query<RowDataPacket[]>(
    "SELECT COUNT(*) as total FROM orders"
  )
  const totalOrders = orderRows[0].total

  // Total clients
  const clientRows = await query<RowDataPacket[]>(
    "SELECT COUNT(*) as total FROM clients"
  )
  const totalClients = clientRows[0].total

  // Pending orders
  const pendingRows = await query<RowDataPacket[]>(
    "SELECT COUNT(*) as total FROM orders WHERE status = 'pending'"
  )
  const pendingOrders = pendingRows[0].total

  // Low stock items
  const lowStockRows = await query<RowDataPacket[]>(
    "SELECT COUNT(*) as total FROM product_variants WHERE stock_quantity <= low_stock_threshold"
  )
  const lowStockItems = lowStockRows[0].total

  // Revenue by month (last 6 months)
  const monthlyRows = await query<RowDataPacket[]>(
    `SELECT 
      DATE_FORMAT(created_at, '%b') as month,
      COALESCE(SUM(CASE WHEN status IN ('confirmed', 'processing', 'shipped', 'delivered') THEN total_amount ELSE 0 END), 0) as revenue
    FROM orders
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
    GROUP BY YEAR(created_at), MONTH(created_at), DATE_FORMAT(created_at, '%b')
    ORDER BY YEAR(created_at) ASC, MONTH(created_at) ASC`
  )
  const revenueByMonth = monthlyRows.map(row => ({
    month: row.month,
    revenue: parseFloat(row.revenue),
  }))

  // Orders by status
  const statusRows = await query<RowDataPacket[]>(
    `SELECT status, COUNT(*) as count FROM orders GROUP BY status`
  )
  const ordersByStatus = statusRows.map(row => ({
    status: row.status,
    count: row.count,
  }))

  return {
    totalRevenue,
    totalOrders,
    totalClients,
    pendingOrders,
    lowStockItems,
    revenueByMonth,
    ordersByStatus,
  }
}

// Export pool for advanced use cases
export { pool }
