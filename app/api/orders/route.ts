import { NextRequest, NextResponse } from "next/server"
import { 
  getSessionByToken, 
  getOrders, 
  createOrder, 
  generateOrderNumber, 
  getOrCreateCart, 
  clearCart,
  getProductById,
  getVariantById
} from "@/lib/db"
import type { ApiResponse, Order, CreateOrderRequest, PaginatedResponse } from "@/lib/types"

async function getClientIdFromRequest(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get("session_token")?.value
  if (!token) return null
  
  const session = await getSessionByToken(token)
  if (!session || session.userType !== "client") return null
  
  return session.userId
}

// GET /api/orders - Get client's orders
export async function GET(request: NextRequest) {
  try {
    const clientId = await getClientIdFromRequest(request)
    
    if (!clientId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "10")

    const { orders, total } = await getOrders({
      clientId,
      status: status || undefined,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    })

    const totalPages = Math.ceil(total / pageSize)

    return NextResponse.json<ApiResponse<PaginatedResponse<Order>>>({
      success: true,
      data: {
        data: orders,
        total,
        page,
        pageSize,
        totalPages,
      },
    })
  } catch (error) {
    console.error("Get orders error:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}

// POST /api/orders - Create new order from cart
export async function POST(request: NextRequest) {
  try {
    const clientId = await getClientIdFromRequest(request)
    
    if (!clientId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const body: CreateOrderRequest = await request.json()
    const {
      shippingName,
      shippingPhone,
      shippingAddressLine1,
      shippingAddressLine2,
      shippingCity,
      shippingState,
      shippingPostalCode,
      paymentMethod,
      customerNotes,
    } = body

    // Validate required fields
    if (!shippingName || !shippingPhone || !shippingAddressLine1 || !shippingCity || !shippingState || !shippingPostalCode) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "All shipping details are required" },
        { status: 400 }
      )
    }

    // Get cart
    const cart = await getOrCreateCart(clientId)
    
    if (!cart.items || cart.items.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Cart is empty" },
        { status: 400 }
      )
    }

    // Calculate totals and prepare order items
    let subtotal = 0
    const orderItems: {
      productId: string
      variantId?: string
      productName: string
      variantName?: string
      sku?: string
      quantity: number
      unitPrice: number
      totalPrice: number
      customization?: object
    }[] = []

    for (const item of cart.items) {
      const product = await getProductById(item.productId)
      const variant = item.variantId ? await getVariantById(item.variantId) : undefined

      if (!product) continue

      const unitPrice = variant?.price || product.basePrice
      const totalPrice = unitPrice * item.quantity
      subtotal += totalPrice

      orderItems.push({
        productId: product.id,
        variantId: variant?.id,
        productName: product.name,
        variantName: variant?.name,
        sku: variant?.sku,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        customization: item.customization,
      })
    }

    // Calculate tax (18% GST)
    const taxAmount = subtotal * 0.18

    // Calculate shipping (free for orders over 10000)
    const shippingAmount = subtotal > 10000 ? 0 : 500

    const totalAmount = subtotal + taxAmount + shippingAmount

    // Create order
    const newOrder = await createOrder({
      clientId,
      orderNumber: generateOrderNumber(),
      subtotal,
      taxAmount,
      shippingAmount,
      discountAmount: 0,
      totalAmount,
      shippingName,
      shippingPhone,
      shippingAddressLine1,
      shippingAddressLine2,
      shippingCity,
      shippingState,
      shippingPostalCode,
      paymentMethod,
      customerNotes,
      items: orderItems,
    })

    // Clear cart after order creation
    await clearCart(cart.id)

    return NextResponse.json<ApiResponse<Order>>({
      success: true,
      data: newOrder,
      message: "Order placed successfully",
    }, { status: 201 })
  } catch (error) {
    console.error("Create order error:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    )
  }
}
