import { NextResponse } from "next/server"
import { getDeliverySettings } from "@/lib/db"
import type { ApiResponse, DeliverySettings } from "@/lib/types"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const settings = await getDeliverySettings()

    return NextResponse.json<ApiResponse<DeliverySettings>>({
      success: true,
      data: settings,
    })
  } catch (error) {
    console.error("Get public delivery settings error:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to fetch delivery settings" },
      { status: 500 }
    )
  }
}
