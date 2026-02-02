import { NextRequest, NextResponse } from "next/server"
import { getSessionByToken, getDashboardStats, getOrders } from "@/lib/db"
import type { ApiResponse } from "@/lib/types"

interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalClients: number
  pendingOrders: number
  lowStockItems: number
  revenueGrowth: number
  ordersGrowth: number
  clientsGrowth: number
  recentOrders: Awaited<ReturnType<typeof getOrders>>["orders"]
  revenueByMonth: { month: string; revenue: number }[]
  ordersByStatus: { status: string; count: number }[]
}

async function isAdminAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get("admin_session_token")?.value
  if (!token) return false
  
  const session = await getSessionByToken(token)
  return !!session && session.userType === "admin"
}

// GET /api/admin/stats - Get dashboard statistics (admin)
export async function GET(request: NextRequest) {
  try {
    if (!await isAdminAuthenticated(request)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Admin authentication required" },
        { status: 401 }
      )
    }

    const dbStats = await getDashboardStats()
    
    // Get recent orders
    const { orders: recentOrders } = await getOrders({ limit: 5 })

    // Mock growth percentages (in production, calculate from historical data)
    const revenueGrowth = 12.5
    const ordersGrowth = 8.3
    const clientsGrowth = 15.2

    const stats: DashboardStats = {
      ...dbStats,
      revenueGrowth,
      ordersGrowth,
      clientsGrowth,
      recentOrders,
    }

    return NextResponse.json<ApiResponse<DashboardStats>>({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error("Admin get stats error:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to fetch statistics" },
      { status: 500 }
    )
  }
}
