import { NextRequest, NextResponse } from "next/server"
import { getSessionByToken, getOrderById, updateOrderStatus } from "@/lib/db"
import type { ApiResponse, Order, UpdateOrderStatusRequest } from "@/lib/types"

async function isAdminAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get("admin_session_token")?.value
  if (!token) return false
  
  const session = await getSessionByToken(token)
  return !!session && session.userType === "admin"
}

// GET /api/admin/orders/[id] - Get order details (admin)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!await isAdminAuthenticated(request)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Admin authentication required" },
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

    return NextResponse.json<ApiResponse<Order>>({
      success: true,
      data: order,
    })
  } catch (error) {
    console.error("Admin get order error:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to fetch order" },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/orders/[id] - Update order status (admin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!await isAdminAuthenticated(request)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Admin authentication required" },
        { status: 401 }
      )
    }

    const { id } = await params
    const body: UpdateOrderStatusRequest = await request.json()
    const { status, paymentStatus, trackingNumber, adminNotes } = body

    const success = await updateOrderStatus(id, {
      status,
      paymentStatus,
      trackingNumber,
      adminNotes,
    })

    if (!success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Order not found" },
        { status: 404 }
      )
    }

    const updatedOrder = await getOrderById(id)

    return NextResponse.json<ApiResponse<Order>>({
      success: true,
      data: updatedOrder!,
      message: "Order updated successfully",
    })
  } catch (error) {
    console.error("Admin update order error:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to update order" },
      { status: 500 }
    )
  }
}
