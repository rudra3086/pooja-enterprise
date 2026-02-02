import { NextRequest, NextResponse } from "next/server"
import { getSessionByToken, getClients } from "@/lib/db"
import type { ApiResponse, Client, PaginatedResponse } from "@/lib/types"

interface ClientWithStats extends Client {
  totalOrders: number
  totalSpent: number
}

async function isAdminAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get("admin_session_token")?.value
  if (!token) return false
  
  const session = await getSessionByToken(token)
  return !!session && session.userType === "admin"
}

// GET /api/admin/clients - Get all clients (admin)
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
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")

    const { clients, total } = await getClients({
      status: status || undefined,
      search: search || undefined,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    })

    const totalPages = Math.ceil(total / pageSize)

    return NextResponse.json<ApiResponse<PaginatedResponse<ClientWithStats>>>({
      success: true,
      data: {
        data: clients,
        total,
        page,
        pageSize,
        totalPages,
      },
    })
  } catch (error) {
    console.error("Admin get clients error:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to fetch clients" },
      { status: 500 }
    )
  }
}
