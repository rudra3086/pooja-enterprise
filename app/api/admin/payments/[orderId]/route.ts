import { NextRequest, NextResponse } from "next/server"
import { getSessionByToken, updatePaymentOrderStatus } from "@/lib/db"
import type { ApiResponse } from "@/lib/types"

async function isAdminAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get("admin_session_token")?.value
  if (!token) return false

  const session = await getSessionByToken(token)
  return !!session && session.userType === "admin"
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    if (!await isAdminAuthenticated(request)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Admin authentication required" },
        { status: 401 }
      )
    }

    const { orderId } = await params
    const body = await request.json()
    const status = body?.status as "paid" | "rejected" | undefined

    if (status !== "paid" && status !== "rejected") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "status must be 'paid' or 'rejected'" },
        { status: 400 }
      )
    }

    const updated = await updatePaymentOrderStatus(orderId, status)

    if (!updated) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Payment order not found" },
        { status: 404 }
      )
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: `Payment marked as ${status}`,
    })
  } catch (error) {
    console.error("Admin update payment status error:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to update payment status" },
      { status: 500 }
    )
  }
}
