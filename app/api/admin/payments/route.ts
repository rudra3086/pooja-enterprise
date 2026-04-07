import { NextRequest, NextResponse } from "next/server"
import { getPaymentOrders, getSessionByToken } from "@/lib/db"
import type { ApiResponse, PaymentOrder } from "@/lib/types"

async function isAdminAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get("admin_session_token")?.value
  if (!token) return false

  const session = await getSessionByToken(token)
  return !!session && session.userType === "admin"
}

export async function GET(request: NextRequest) {
  try {
    if (!await isAdminAuthenticated(request)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Admin authentication required" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") as PaymentOrder["status"] | null

    const orders = await getPaymentOrders({
      status: status || undefined,
    })

    return NextResponse.json<ApiResponse<PaymentOrder[]>>({
      success: true,
      data: orders,
    })
  } catch (error) {
    console.error("Admin get payments error:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to fetch payment orders" },
      { status: 500 }
    )
  }
}
