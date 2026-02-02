import { NextRequest, NextResponse } from "next/server"
import { getSessionByToken, getOrCreateCart, updateCartItemQuantity, removeCartItem } from "@/lib/db"
import type { ApiResponse, Cart } from "@/lib/types"

async function getClientIdFromRequest(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get("session_token")?.value
  if (!token) return null
  
  const session = await getSessionByToken(token)
  if (!session || session.userType !== "client") return null
  
  return session.userId
}

// PATCH /api/cart/[itemId] - Update cart item quantity
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const clientId = await getClientIdFromRequest(request)
    
    if (!clientId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const { itemId } = await params
    const body = await request.json()
    const { quantity } = body

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      await removeCartItem(itemId)
    } else {
      await updateCartItemQuantity(itemId, quantity)
    }

    // Return updated cart
    const cart = await getOrCreateCart(clientId)

    return NextResponse.json<ApiResponse<Cart>>({
      success: true,
      data: cart,
      message: "Cart updated",
    })
  } catch (error) {
    console.error("Update cart item error:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to update cart item" },
      { status: 500 }
    )
  }
}

// DELETE /api/cart/[itemId] - Remove item from cart
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const clientId = await getClientIdFromRequest(request)
    
    if (!clientId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const { itemId } = await params
    
    await removeCartItem(itemId)

    // Return updated cart
    const cart = await getOrCreateCart(clientId)

    return NextResponse.json<ApiResponse<Cart>>({
      success: true,
      data: cart,
      message: "Item removed from cart",
    })
  } catch (error) {
    console.error("Remove cart item error:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to remove cart item" },
      { status: 500 }
    )
  }
}
