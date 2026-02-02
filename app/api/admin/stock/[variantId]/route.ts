import { NextRequest, NextResponse } from "next/server"
import { getSessionByToken, updateVariantStock, getVariantById } from "@/lib/db"
import type { ApiResponse, ProductVariant, UpdateStockRequest } from "@/lib/types"

async function isAdminAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get("admin_session_token")?.value
  if (!token) return false
  
  const session = await getSessionByToken(token)
  return !!session && session.userType === "admin"
}

// PATCH /api/admin/stock/[variantId] - Update stock quantity (admin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ variantId: string }> }
) {
  try {
    if (!await isAdminAuthenticated(request)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Admin authentication required" },
        { status: 401 }
      )
    }

    const { variantId } = await params
    const body: Omit<UpdateStockRequest, 'variantId'> = await request.json()
    const { quantity, operation = "set" } = body

    const success = await updateVariantStock(variantId, quantity, operation)

    if (!success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Variant not found" },
        { status: 404 }
      )
    }

    const variant = await getVariantById(variantId)

    return NextResponse.json<ApiResponse<ProductVariant>>({
      success: true,
      data: variant!,
      message: `Stock ${operation === "set" ? "set to" : operation === "add" ? "increased by" : "decreased by"} ${quantity}`,
    })
  } catch (error) {
    console.error("Admin update stock error:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to update stock" },
      { status: 500 }
    )
  }
}
