import { NextRequest, NextResponse } from "next/server"
import { getSessionByToken, getOrCreateCart, addToCart, clearCart, getProductById, getVariantById } from "@/lib/db"
import type { ApiResponse, Cart, AddToCartRequest } from "@/lib/types"

async function getClientIdFromRequest(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get("session_token")?.value
  if (!token) return null
  
  const session = await getSessionByToken(token)
  if (!session || session.userType !== "client") return null
  
  return session.userId
}

// GET /api/cart - Get current user's cart
export async function GET(request: NextRequest) {
  try {
    const clientId = await getClientIdFromRequest(request)
    
    if (!clientId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const cart = await getOrCreateCart(clientId)

    return NextResponse.json<ApiResponse<Cart>>({
      success: true,
      data: cart,
    })
  } catch (error) {
    console.error("Get cart error:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to fetch cart" },
      { status: 500 }
    )
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const clientId = await getClientIdFromRequest(request)
    
    if (!clientId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const body: AddToCartRequest = await request.json()
    const { productId, variantId, quantity, customization } = body

    // Validate product exists
    const product = await getProductById(productId)
    if (!product) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Product not found" },
        { status: 404 }
      )
    }

    // Validate variant if provided
    if (variantId) {
      const variant = await getVariantById(variantId)
      if (!variant || variant.productId !== productId) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: "Invalid product variant" },
          { status: 400 }
        )
      }
    }

    // Validate quantity
    if (quantity < product.minOrderQuantity) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: `Minimum order quantity is ${product.minOrderQuantity}` },
        { status: 400 }
      )
    }

    // Get or create cart and add item
    const cart = await getOrCreateCart(clientId)
    await addToCart(cart.id, productId, variantId || null, quantity, customization)

    // Return updated cart
    const updatedCart = await getOrCreateCart(clientId)

    return NextResponse.json<ApiResponse<Cart>>({
      success: true,
      data: updatedCart,
      message: "Item added to cart",
    })
  } catch (error) {
    console.error("Add to cart error:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to add item to cart" },
      { status: 500 }
    )
  }
}

// DELETE /api/cart - Clear cart
export async function DELETE(request: NextRequest) {
  try {
    const clientId = await getClientIdFromRequest(request)
    
    if (!clientId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const cart = await getOrCreateCart(clientId)
    await clearCart(cart.id)

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Cart cleared",
    })
  } catch (error) {
    console.error("Clear cart error:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to clear cart" },
      { status: 500 }
    )
  }
}
