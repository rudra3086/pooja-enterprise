import { NextRequest, NextResponse } from "next/server"
import { getSessionByToken, getOrders, getClientById } from "@/lib/db"
import type { ApiResponse } from "@/lib/types"

interface DashboardStats {
  totalOrders: number
  activeOrders: number
  completedOrders: number
  totalSpent: number
  recentOrders: any[]
  clientName: string
}

async function getClientIdFromRequest(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get("session_token")?.value
  if (!token) return null
  
  const session = await getSessionByToken(token)
  if (!session || session.userType !== "client") return null
  
  return session.userId
}

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const clientId = await getClientIdFromRequest(request)
    
    if (!clientId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    // Get client info
    const client = await getClientById(clientId)
    if (!client) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Client not found" },
        { status: 404 }
      )
    }

    // Get all orders for this client
    const { orders, total } = await getOrders({
      clientId,
      limit: 1000, // Get all orders for stats
    })

    // Calculate stats
    const totalOrders = total
    const activeOrders = orders.filter(o => o.status === "pending" || o.status === "confirmed").length
    const completedOrders = orders.filter(o => o.status === "delivered").length
    const totalSpent = orders.reduce((sum, o) => sum + o.totalAmount, 0)

    // Get recent 5 orders
    const recentOrders = orders.slice(0, 5).map(order => ({
      id: order.orderNumber,
      date: order.createdAt,
      items: (order.items || []).map(item => `${item.productName}${item.variantName ? ` (${item.variantName})` : ''} (${item.quantity} units)`).join(", "),
      total: order.totalAmount,
      status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
    }))

    const stats: DashboardStats = {
      totalOrders,
      activeOrders,
      completedOrders,
      totalSpent,
      recentOrders,
      clientName: client.contactPerson || client.businessName,
    }

    return NextResponse.json<ApiResponse<DashboardStats>>({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to fetch dashboard stats" },
      { status: 500 }
    )
  }
}
