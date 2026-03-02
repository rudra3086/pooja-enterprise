import { NextRequest, NextResponse } from "next/server"
import { 
  getSessionByToken, 
  getOrders, 
  createOrder, 
  generateOrderNumber, 
  getOrCreateCart, 
  clearCart,
  getProductById,
  getVariantById,
  getDeliverySettings,
  calculateDistanceKm
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

    const body: CreateOrderRequest & { items?: any[] } = await request.json()
    const {
      requiresShipping,
      shippingName,
      shippingPhone,
      shippingAddressLine1,
      shippingAddressLine2,
      shippingCity,
      shippingState,
      shippingPostalCode,
      deliveryLatitude,
      deliveryLongitude,
      paymentMethod,
      customerNotes,
      items: providedItems,
    } = body

    const isShippingRequired = requiresShipping !== false

    // Validate required fields
    if (!shippingName || !shippingPhone) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Contact name and phone are required" },
        { status: 400 }
      )
    }

    if (isShippingRequired && (!shippingAddressLine1 || !shippingCity || !shippingState || !shippingPostalCode)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "All shipping details are required" },
        { status: 400 }
      )
    }

    if (isShippingRequired && (deliveryLatitude === undefined || deliveryLongitude === undefined)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Please select delivery location on map" },
        { status: 400 }
      )
    }

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

    // Get cart regardless to handle clearing later
    const cart = await getOrCreateCart(clientId)

    if (providedItems && providedItems.length > 0) {
      // Use items provided in the request body
      for (const item of providedItems) {
        const product = await getProductById(item.productId || item.id)
        if (!product) continue

        const unitPrice = item.price || product.basePrice
        const customizationCost = (item.customization?.additionalCost || 0) * item.quantity
        const totalPrice = (unitPrice * item.quantity) + customizationCost
        subtotal += totalPrice

        // Only include customization if it exists and is not undefined
        const orderItem: any = {
          productId: product.id,
          variantId: item.variantId,
          productName: product.name,
          variantName: item.variantName,
          sku: item.sku,
          quantity: item.quantity,
          unitPrice,
          totalPrice,
        }
        
        if (item.customization !== undefined && item.customization !== null) {
          orderItem.customization = item.customization
        }
        
        orderItems.push(orderItem)
      }
    } else {
      if (!cart.items || cart.items.length === 0) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: "Cart is empty" },
          { status: 400 }
        )
      }

      for (const item of cart.items) {
        const product = await getProductById(item.productId)
        const variant = item.variantId ? await getVariantById(item.variantId) : undefined

        if (!product) continue

        const unitPrice = variant?.price || product.basePrice
        const customizationCost = (item.customization?.additionalCost || 0) * item.quantity
        const totalPrice = (unitPrice * item.quantity) + customizationCost
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
    }

    if (orderItems.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "No valid items to order" },
        { status: 400 }
      )
    }

    // Calculate tax (18% GST)
    const taxAmount = subtotal * 0.18

    const deliverySettings = await getDeliverySettings()

    let distanceKm = 0
    let shippingAmount = 0

    if (isShippingRequired) {
      distanceKm = calculateDistanceKm(
        deliverySettings.productionLatitude,
        deliverySettings.productionLongitude,
        Number(deliveryLatitude),
        Number(deliveryLongitude)
      )
      shippingAmount = Math.round(distanceKm * deliverySettings.deliveryCostPerKm)
    }

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
      shippingAddressLine1: isShippingRequired ? shippingAddressLine1 : (shippingAddressLine1 || "Self Pickup"),
      shippingAddressLine2,
      shippingCity: isShippingRequired ? shippingCity : (shippingCity || "N/A"),
      shippingState: isShippingRequired ? shippingState : (shippingState || "N/A"),
      shippingPostalCode: isShippingRequired ? shippingPostalCode : (shippingPostalCode || "000000"),
      requiresShipping: isShippingRequired,
      deliveryLatitude: isShippingRequired ? Number(deliveryLatitude) : undefined,
      deliveryLongitude: isShippingRequired ? Number(deliveryLongitude) : undefined,
      productionLatitude: isShippingRequired ? deliverySettings.productionLatitude : undefined,
      productionLongitude: isShippingRequired ? deliverySettings.productionLongitude : undefined,
      distanceKm: isShippingRequired ? distanceKm : undefined,
      deliveryCostPerKm: isShippingRequired ? deliverySettings.deliveryCostPerKm : undefined,
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
    const errorMessage = error instanceof Error ? error.message : "Failed to create order"
    return NextResponse.json<ApiResponse>(
      { success: false, error: `Failed to create order: ${errorMessage}` },
      { status: 500 }
    )
  }
}
