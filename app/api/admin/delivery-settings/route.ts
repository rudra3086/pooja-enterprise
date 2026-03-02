import { NextRequest, NextResponse } from "next/server"
import { getSessionByToken, getDeliverySettings, updateDeliverySettings } from "@/lib/db"
import type { ApiResponse, DeliverySettings } from "@/lib/types"

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

    const settings = await getDeliverySettings()

    return NextResponse.json<ApiResponse<DeliverySettings>>({
      success: true,
      data: settings,
    })
  } catch (error) {
    console.error("Get delivery settings error:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to fetch delivery settings" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!await isAdminAuthenticated(request)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Admin authentication required" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const productionLatitude = body.productionLatitude !== undefined ? Number(body.productionLatitude) : undefined
    const productionLongitude = body.productionLongitude !== undefined ? Number(body.productionLongitude) : undefined
    const deliveryCostPerKm = body.deliveryCostPerKm !== undefined ? Number(body.deliveryCostPerKm) : undefined

    if (productionLatitude !== undefined && (Number.isNaN(productionLatitude) || productionLatitude < -90 || productionLatitude > 90)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid production latitude" },
        { status: 400 }
      )
    }

    if (productionLongitude !== undefined && (Number.isNaN(productionLongitude) || productionLongitude < -180 || productionLongitude > 180)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid production longitude" },
        { status: 400 }
      )
    }

    if (deliveryCostPerKm !== undefined && (Number.isNaN(deliveryCostPerKm) || deliveryCostPerKm < 0)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Delivery cost per kilometer must be 0 or more" },
        { status: 400 }
      )
    }

    const settings = await updateDeliverySettings({
      productionLatitude,
      productionLongitude,
      deliveryCostPerKm,
    })

    return NextResponse.json<ApiResponse<DeliverySettings>>({
      success: true,
      data: settings,
      message: "Delivery settings updated successfully",
    })
  } catch (error) {
    console.error("Update delivery settings error:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to update delivery settings" },
      { status: 500 }
    )
  }
}
