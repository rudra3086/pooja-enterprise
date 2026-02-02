import { NextRequest, NextResponse } from "next/server"
import { getSessionByToken, getOrders } from "@/lib/db"
import type { ApiResponse, Order, PaginatedResponse } from "@/lib/types"

async function isAdminAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get("admin_session_token")?.value
  if (!token) return false
  
  const session = await getSessionByToken(token)
  return !!session && session.userType === "admin"
}

// GET /api/admin/orders - Get all orders (admin)
export async function GET(request: NextRequest) {
  try {
    if (!await isAdminAuthenticated(request)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Admin authentication required" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const clientId = searchParams.get("clientId")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")

    const { orders, total } = await getOrders({
      clientId: clientId || undefined,
      status: status || undefined,
      search: search || undefined,
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
    console.error("Admin get orders error:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}
