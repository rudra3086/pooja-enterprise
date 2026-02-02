import { NextRequest, NextResponse } from "next/server"
import { getSessionByToken, getClientById, updateClientStatus, getOrders } from "@/lib/db"
import type { ApiResponse, Client } from "@/lib/types"

async function isAdminAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get("admin_session_token")?.value
  if (!token) return false
  
  const session = await getSessionByToken(token)
  return !!session && session.userType === "admin"
}

// GET /api/admin/clients/[id] - Get client details (admin)
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
    const client = await getClientById(id)

    if (!client) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Client not found" },
        { status: 404 }
      )
    }

    // Get client's orders
    const { orders: clientOrders } = await getOrders({ clientId: client.id })
    const totalSpent = clientOrders
      .filter(o => o.paymentStatus === "paid")
      .reduce((sum, o) => sum + o.totalAmount, 0)

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        ...client,
        totalOrders: clientOrders.length,
        totalSpent,
        recentOrders: clientOrders.slice(0, 5),
      },
    })
  } catch (error) {
    console.error("Admin get client error:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to fetch client" },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/clients/[id] - Update client status (admin)
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
    const body = await request.json()
    const { status } = body

    // Validate status
    const validStatuses = ["pending", "approved", "suspended"]
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid status" },
        { status: 400 }
      )
    }

    const success = await updateClientStatus(id, status)
    
    if (!success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Client not found" },
        { status: 404 }
      )
    }

    const client = await getClientById(id)

    return NextResponse.json<ApiResponse<Client>>({
      success: true,
      data: client!,
      message: `Client ${status === "approved" ? "approved" : status === "suspended" ? "suspended" : "updated"} successfully`,
    })
  } catch (error) {
    console.error("Admin update client error:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to update client" },
      { status: 500 }
    )
  }
}
