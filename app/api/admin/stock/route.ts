import { NextRequest, NextResponse } from "next/server"
import { getSessionByToken, getAllVariants, updateVariantStock, updateVariantDetails } from "@/lib/db"
import type { ApiResponse, ProductVariant, PaginatedResponse, UpdateStockRequest } from "@/lib/types"

interface StockItem extends ProductVariant {
  productName: string
  categoryId: string
}

async function isAdminAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get("admin_session_token")?.value
  if (!token) return false
  
  const session = await getSessionByToken(token)
  return !!session && session.userType === "admin"
}

// GET /api/admin/stock - Get all stock items (admin)
export async function GET(request: NextRequest) {
  try {
    if (!await isAdminAuthenticated(request)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Admin authentication required" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")
    const lowStock = searchParams.get("lowStock")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")

    const { variants, total } = await getAllVariants({
      productId: productId || undefined,
      lowStock: lowStock === "true",
      search: search || undefined,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    })

    const totalPages = Math.ceil(total / pageSize)

    return NextResponse.json<ApiResponse<PaginatedResponse<StockItem>>>({
      success: true,
      data: {
        data: variants,
        total,
        page,
        pageSize,
        totalPages,
      },
    })
  } catch (error) {
    console.error("Admin get stock error:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to fetch stock" },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/stock - Update stock quantity and variant details (admin)
export async function PATCH(request: NextRequest) {
  try {
    if (!await isAdminAuthenticated(request)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Admin authentication required" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { variantId, quantity, operation, price, lowStockThreshold } = body

    if (!variantId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "variantId is required" },
        { status: 400 }
      )
    }

    // Update stock quantity if provided
    if (quantity !== undefined && operation) {
      if (!["set", "add", "subtract"].includes(operation)) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: "Invalid operation" },
          { status: 400 }
        )
      }

      const stockSuccess = await updateVariantStock(variantId, quantity, operation)
      if (!stockSuccess) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: "Variant not found" },
          { status: 404 }
        )
      }
    }

    // Update price and/or low stock threshold if provided
    if (price !== undefined || lowStockThreshold !== undefined) {
      const detailsSuccess = await updateVariantDetails(variantId, {
        price,
        lowStockThreshold,
      })
      if (!detailsSuccess) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: "Failed to update variant details" },
          { status: 404 }
        )
      }
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Variant updated successfully",
    })
  } catch (error) {
    console.error("Admin update stock error:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to update variant" },
      { status: 500 }
    )
  }
}
