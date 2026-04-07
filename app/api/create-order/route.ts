import { NextRequest, NextResponse } from "next/server"
import { createPaymentOrder, getSessionByToken } from "@/lib/db"
import type { ApiResponse, PaymentOrder } from "@/lib/types"

async function getClientIdFromRequest(request: NextRequest): Promise<string | undefined> {
  const token = request.cookies.get("session_token")?.value
  if (!token) return undefined

  const session = await getSessionByToken(token)
  if (!session || session.userType !== "client") return undefined

  return session.userId
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const amountRaw = Number(body?.amount)

    if (!Number.isFinite(amountRaw) || amountRaw <= 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Valid amount is required" },
        { status: 400 }
      )
    }

    const paymentOrder = await createPaymentOrder({
      amount: Number(amountRaw.toFixed(2)),
      clientId: await getClientIdFromRequest(request),
    })

    return NextResponse.json<ApiResponse<PaymentOrder>>({
      success: true,
      data: paymentOrder,
      message: "Payment order created",
    })
  } catch (error) {
    console.error("Create payment order error:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to create payment order" },
      { status: 500 }
    )
  }
}
