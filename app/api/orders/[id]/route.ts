import { NextRequest, NextResponse } from "next/server"
import { getOrderById, getSessionByToken, hideOrderForClient, restoreOrderForClient } from "@/lib/db"
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

// DELETE /api/orders/[id] - Hide delivered/cancelled order from client view
export async function DELETE(
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
    const order = await getOrderById(id)

    if (!order) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Order not found" },
        { status: 404 }
      )
    }

    if (order.clientId !== clientId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      )
    }

    if (order.status !== "delivered" && order.status !== "cancelled") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Only delivered or cancelled orders can be removed" },
        { status: 400 }
      )
    }

    const success = await hideOrderForClient(id, clientId)
    if (!success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Order is already removed" },
        { status: 400 }
      )
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Order removed from your list",
    })
  } catch (error) {
    console.error("Remove order error:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to remove order" },
      { status: 500 }
    )
  }
}

// PATCH /api/orders/[id] - Restore removed order
export async function PATCH(
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

    const body = await request.json().catch(() => ({}))
    if (body?.action !== "restore") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid action" },
        { status: 400 }
      )
    }

    const { id } = await params
    const order = await getOrderById(id)

    if (!order) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Order not found" },
        { status: 404 }
      )
    }

    if (order.clientId !== clientId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      )
    }

    const success = await restoreOrderForClient(id, clientId)
    if (!success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Order is not removed" },
        { status: 400 }
      )
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Order restored",
    })
  } catch (error) {
    console.error("Restore order error:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to restore order" },
      { status: 500 }
    )
  }
}
