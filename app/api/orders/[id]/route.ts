import { NextRequest, NextResponse } from "next/server"
import { getOrderById, getSessionByToken } from "@/lib/db"
import type { ApiResponse, Order } from "@/lib/types"

async function getClientIdFromRequest(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get("session_token")?.value
  if (!token) return null
  
  const session = await getSessionByToken(token)
  if (!session || session.userType !== "client") return null
  
  return session.userId
}

// GET /api/orders/[id] - Get order by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const clientId = await getClientIdFromRequest(request)
    
    if (!clientId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const { id } = await params

    // Find order
    const order = await getOrderById(id)

    if (!order) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Order not found" },
        { status: 404 }
      )
    }

    // Verify ownership
    if (order.clientId !== clientId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      )
    }

    return NextResponse.json<ApiResponse<Order>>({
      success: true,
      data: order,
    })
  } catch (error) {
    console.error("Get order error:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to fetch order" },
      { status: 500 }
    )
  }
}
